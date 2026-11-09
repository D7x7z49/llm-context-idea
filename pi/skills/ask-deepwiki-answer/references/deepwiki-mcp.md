<!-- pi/skills/ask-deepwiki-answer/references/deepwiki-mcp.md -->
<!-- NOTE: the DeepWiki MCP surface as invariants; change a line only when the server changes it. -->

SCOPE
- cover the public DeepWiki MCP server at <https://mcp.deepwiki.com/mcp>
- serve a public repository without an account
- serve a private repository only with a Devin account and OAuth
- summarize the client view, and keep the upstream page as the authority for its own text

SOURCE
- read <https://docs.devin.ai/work-with-devin/deepwiki-mcp> as the upstream page

TOOLS
- call `read_wiki_structure` for the page list of one repository
- call `read_wiki_contents` for the whole wiki of one repository
- call `ask_wiki_question` for a grounded answer
- accept `ask_question` as an alias, so either name reaches the same tool
- pass `repoName` plus `question` to the ask tool
- pass `repoName` alone to the structure and contents tools
- pass an array of up to ten repositories as `repoName` for one answer
- expect `list_wiki_repos`, `generate_wiki`, and the `devin_*` tools to need private mode

WIRE
- post JSON-RPC 2.0 to the `/mcp` path
- use `/mcp` and treat `/sse` as the legacy transport
- send `Accept: application/json, text/event-stream`
- send `MCP-Protocol-Version: 2025-06-18`
- expect a stateless server: no session id header and no `initialize` handshake
- read the reply as SSE and take the JSON object from the `data` lines
- send `tools/call` with `params.name` and `params.arguments`
- read the answer from `result.content[].text`
- skip `notifications/initialized`, the server accepts a direct call
- treat `result.isError` as a failure even when HTTP is `200`

ERRORS
- expect a malformed repository name to fail before any lookup
- expect an unindexed repository to fail inside the tool result, with a pointer to <https://deepwiki.com>
- expect a private-mode tool to fail without a session or an account

SIZE
- expect a wiki of tens of pages and a few hundred KB
- expect one page of a few hundred lines
- expect an ask to take seconds rather than milliseconds
- slice by page, because a full wiki exceeds one output budget
- expect each page to open with `# Page: <title>` and repeat the title as a heading

CONNECTION
- keep the direct connection as the default, because a local proxy can reset the TLS handshake
- pass `--proxy` when the environment requires the proxy path
