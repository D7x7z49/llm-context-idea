# @path[pi/skills/ask-deepwiki-answer/scripts/messages.py]
# every human-facing string, plus the two error origins.

# ==============================================================================
# MESSAGES
# ==============================================================================

MESSAGES = {
    "cli.description": "talk to the DeepWiki MCP server",
    "cli.ask": "ask one question about public repositories",
    "cli.ask.repo": "primary repository as [owner/repo]",
    "cli.ask.question": "question text",
    "cli.ask.related": "related repository, repeatable, ten in total",
    "cli.structure": "list the wiki pages of a repository",
    "cli.contents": "download the full wiki, which is slow and large",
    "cli.page": "print one page from a cached wiki",
    "cli.page.repo": "repository as [owner/repo]",
    "cli.page.selector": "page number or a title fragment; omit to list pages",
    "cli.page.max": "print at most this many lines",
    "cli.answers": "list cached answers",
    "cli.answers.repo": "only answers for this primary repository",
    "cli.refresh": "ask or fetch again instead of reading the cache",
    "cli.proxy": "honor [http_proxy] and [https_proxy]; the default is a direct call",
    "error.repo.format": "repo must look like [owner/repo], got [{repo}]",
    "error.repo.segment": "repo has an unsafe segment at [{repo}]",
    "error.repo.chars": "repo has a character outside [a-z0-9._-] at [{repo}]",
    "error.repo.limit": "at most [{max}] repositories per question, got [{count}]",
    "error.wiki.missing": "no cached wiki at [{path}], run [contents {repo}] first",
    "error.wiki.marker": "cached wiki has no page marker at [{path}]",
    "error.page.range": "page [{page}] is outside 1 to [{pages}]",
    "error.page.none": "no page title matches [{selector}]",
    "error.page.many": "page title is ambiguous at [{selector}]: [{titles}]",
    "error.http": "http [{status}] from the server: [{body}]",
    "error.network": "network failure: [{reason}]",
    "error.jsonrpc": "server error [{code}]: [{reason}]",
    "error.result": "the server response holds no result",
    "error.tool": "the server rejected the call: [{text}]",
    "error.empty": "the server returned an empty result",
    "error.cache": "cannot read the cache at [{path}]: [{error}]",
    "note.cached": "cached answer from [{stamp}], add [--refresh] to ask again",
    "note.truncated": "[{count}] lines left in [{path}], from [{first}] to [{last}]",
    "note.answers.none": "no cached answers",
    "report.contents": "[{path}] holds [{pages}] pages and [{lines}] lines",
    "report.pages": "cache: [{path}]",
    "report.page_count": "pages: [{pages}] lines: [{lines}]",
    "report.answer": "{stamp}  {primary}  {related}  {question}",
}


def message(key, **values):
    return MESSAGES[key].format(**values)


# ==============================================================================
# ERRORS
# ==============================================================================
# two origins, one boundary: input errors and server errors reach the user from cli


class CliError(RuntimeError):
    pass


class ServerError(RuntimeError):
    pass
