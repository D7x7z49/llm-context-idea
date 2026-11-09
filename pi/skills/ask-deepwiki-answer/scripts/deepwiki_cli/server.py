# @path[pi/skills/ask-deepwiki-answer/scripts/deepwiki_cli/server.py]
# the DeepWiki MCP server: JSON-RPC over HTTP, with an SSE framed reply.

import json
import time
import urllib.error
import urllib.request

from .messages import ServerError, message

# ==============================================================================
# CONSTANTS
# ==============================================================================

SERVER_URL = "https://mcp.deepwiki.com/mcp"
PROTOCOL_VERSION = "2025-06-18"

TOOL_ASK = ("ask_wiki_question", "ask_question")
TOOL_STRUCTURE = "read_wiki_structure"
TOOL_CONTENTS = "read_wiki_contents"

REQUEST_TIMEOUT_S = 180
RETRY_ATTEMPTS = 3
RETRY_DELAY_S = 1.0
RETRY_STATUS = {429, 500, 502, 503, 504}

# ==============================================================================
# TRANSPORT
# ==============================================================================


def build_opener(use_proxy):
    # a direct call by default, because a local proxy can reset the TLS handshake
    if use_proxy:
        return urllib.request.build_opener()
    return urllib.request.build_opener(urllib.request.ProxyHandler({}))


def post(payload, opener):
    headers = {
        "Content-Type": "application/json",
        "Accept": "application/json, text/event-stream",
        "MCP-Protocol-Version": PROTOCOL_VERSION,
    }
    body = json.dumps(payload).encode("utf-8")
    request = urllib.request.Request(
        SERVER_URL, data=body, headers=headers, method="POST"
    )
    reason = "request failed"

    for attempt in range(RETRY_ATTEMPTS):
        try:
            with opener.open(request, timeout=REQUEST_TIMEOUT_S) as response:
                return response.read().decode("utf-8", "replace")
        except urllib.error.HTTPError as error:
            detail = error.read()[:300].decode("utf-8", "replace")
            message_text = message("error.http", status=error.code, body=detail)
            if error.code not in RETRY_STATUS:
                raise ServerError(message_text) from error
            reason = message_text
        except urllib.error.URLError as error:
            reason = message("error.network", reason=error.reason)

        if attempt + 1 == RETRY_ATTEMPTS:
            break
        time.sleep(RETRY_DELAY_S * (2 ** attempt))

    raise ServerError(reason)


def parse_sse_events(raw):
    """Split an SSE body into events, joining the data lines of one event."""
    events = []
    data = []
    for line in raw.splitlines():
        if line.startswith("data:"):
            data.append(line[5:].lstrip())
        elif not line.strip() and data:
            events.append("\n".join(data))
            data = []
    if data:
        events.append("\n".join(data))
    return events


def decode_result(raw, expected_id=1):
    for text in parse_sse_events(raw) or [raw.strip()]:
        try:
            payload = json.loads(text)
        except json.JSONDecodeError:
            continue
        if "error" in payload:
            error = payload["error"]
            raise ServerError(
                message(
                    "error.jsonrpc",
                    code=error.get("code", "?"),
                    reason=error.get("message", "unknown"),
                )
            )
        if payload.get("id") not in (None, expected_id):
            continue
        if "result" in payload:
            return payload["result"]
    raise ServerError(message("error.result"))


def content_text(result):
    parts = [
        item.get("text", "")
        for item in result.get("content", [])
        if item.get("type") == "text"
    ]
    text = "\n".join(part for part in parts if part).strip()
    if result.get("isError"):
        raise ServerError(message("error.tool", text=text or "unknown"))
    if not text:
        raise ServerError(message("error.empty"))
    return text


def call_tool(name, arguments, opener):
    payload = {
        "jsonrpc": "2.0",
        "id": 1,
        "method": "tools/call",
        "params": {"name": name, "arguments": arguments},
    }
    return content_text(decode_result(post(payload, opener)))


def call_ask(repos, question, opener):
    # the live server renamed the ask tool, so try that name before the old one
    last_error = None
    for name in TOOL_ASK:
        repo_arg = repos[0] if len(repos) == 1 else repos
        try:
            text = call_tool(name, {"repoName": repo_arg, "question": question}, opener)
            return name, text
        except ServerError as error:
            last_error = error
            if "unknown tool" not in str(error).lower():
                raise
    raise last_error
