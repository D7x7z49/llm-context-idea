# @path[pi/skills/fetch-deepseek-share/scripts/deepseek_cli/api.py]
# the share api: id parsing, one GET with retries, and the payload shape.

import json
import re
import time
import urllib.error
import urllib.parse
import urllib.request

from .messages import ShareError, UsageError, message

# ==============================================================================
# CONSTANTS
# ==============================================================================

API_URL = "https://chat.deepseek.com/api/v0/share/content?share_id={share_id}"
SHARE_ID_RE = re.compile(r"^[a-z0-9]{8,32}$")

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 "
        "(KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36"
    ),
    "Accept": "*/*",
    "Origin": "https://chat.deepseek.com",
    "x-client-platform": "web",
}

REQUEST_TIMEOUT_S = 30
RETRY_ATTEMPTS = 3
RETRY_DELAY_S = 1.0
RETRY_STATUS = {429, 500, 502, 503, 504}

# ==============================================================================
# SHARE ID
# ==============================================================================


def parse_share_id(value):
    text = value.strip()
    parsed = urllib.parse.urlparse(text)
    if parsed.scheme or parsed.netloc:
        share_id = urllib.parse.parse_qs(parsed.query).get("share_id", [""])[0]
        if share_id:
            text = share_id
        else:
            parts = [part for part in parsed.path.split("/") if part]
            if "share" in parts:
                index = parts.index("share")
                if index + 1 < len(parts):
                    text = parts[index + 1]

    if not SHARE_ID_RE.fullmatch(text):
        raise UsageError(message("error.id", value=value))
    return text


# ==============================================================================
# FETCH
# ==============================================================================


def fetch_raw(share_id):
    url = API_URL.format(share_id=share_id)
    headers = dict(HEADERS)
    headers["Referer"] = f"https://chat.deepseek.com/share/{share_id}"
    reason = "request failed"

    for attempt in range(RETRY_ATTEMPTS):
        request = urllib.request.Request(url, headers=headers)
        try:
            with urllib.request.urlopen(request, timeout=REQUEST_TIMEOUT_S) as response:
                return response.read()
        except urllib.error.HTTPError as error:
            body = error.read()[:200].decode("utf-8", "replace")
            reason = message("error.http", status=error.code, body=body)
            if error.code not in RETRY_STATUS:
                raise ShareError(reason) from error
        except urllib.error.URLError as error:
            reason = message("error.network", reason=error.reason)

        if attempt + 1 == RETRY_ATTEMPTS:
            break
        time.sleep(RETRY_DELAY_S * (2 ** attempt))

    raise ShareError(reason)


def parse_payload(raw):
    try:
        payload = json.loads(raw)
    except (json.JSONDecodeError, UnicodeDecodeError) as error:
        raise ShareError(message("error.payload", error=error)) from error

    if payload.get("code") != 0:
        raise ShareError(
            message("error.share", reason=payload.get("msg") or "unknown error")
        )
    return payload


# ==============================================================================
# PAYLOAD SHAPE
# ==============================================================================


def share_messages(payload):
    data = payload.get("data") or {}
    biz_data = data.get("biz_data") or {}
    return biz_data.get("messages") or []
