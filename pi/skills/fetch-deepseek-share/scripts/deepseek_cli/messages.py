# @path[pi/skills/fetch-deepseek-share/scripts/deepseek_cli/messages.py]
# every human-facing string, plus the two failure kinds.

# ==============================================================================
# MESSAGES
# ==============================================================================

MESSAGES = {
    "cli.description": "fetch and read a DeepSeek shared conversation",
    "cli.fetch": "download one share and cache the raw json",
    "cli.show": "print cached sections, or one message in full",
    "cli.target": "share id or share url",
    "cli.refresh": "fetch again even when the cache already holds the share",
    "cli.number": "message number to print in full",
    "cli.offset": "skip this many sections",
    "cli.limit": "print at most this many sections",
    "cli.rebuild": "rebuild the markdown view before reading",
    "error.id": "share id must be 8 to 32 lowercase letters or digits, got [{value}]",
    "error.offset.negative": "offset must be zero or more, got [{value}]",
    "error.limit.negative": "limit must be zero or more, got [{value}]",
    "error.number.range": "message [{number}] is outside 1 to [{count}]",
    "error.http": "http [{status}] from the share api: [{body}]",
    "error.network": "network failure: [{reason}]",
    "error.payload": "the response is not json: [{error}]",
    "error.share": "the share request failed: [{reason}]",
    "error.cache.missing": "no cached share at [{path}], run [fetch {target}] first",
    "error.cache.unreadable": "the cache at [{path}] is unreadable: [{error}]",
    "note.cached": "cache hit at [{path}], add [--refresh] to fetch again",
    "note.repair": "the cache at [{path}] is unreadable, fetching again",
    "note.empty.share": "the share holds no messages, nothing to cache",
    "note.empty.sections": "the share holds no readable sections",
    "note.empty.message": "message [{number}] holds no readable content",
    "note.offset": "offset [{offset}] is past the last section [{count}]",
}

# ==============================================================================
# FAILURES
# ==============================================================================
# a usage error is a bad request; a share error is a failed fetch or a bad cache


class UsageError(RuntimeError):
    pass


class ShareError(RuntimeError):
    pass


def message(key, **values):
    return MESSAGES[key].format(**values)
