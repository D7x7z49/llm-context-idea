# @path[pi/skills/ask-deepwiki-answer/scripts/deepwiki_cli/store.py]
# cache layout: where a request, an answer, and a wiki live on disk.

import calendar
import hashlib
import json
import os
import re
import tempfile
import time
from pathlib import Path

from .messages import CliError, message

# ==============================================================================
# CONSTANTS
# ==============================================================================

CACHE_ROOT = Path.home() / ".agents" / ".cache" / "ask-deepwiki-answer"

REQUEST_FILE = "request.json"
ANSWER_FILE = "answer.md"
META_FILE = "meta.json"
WIKI_FILE = {"structure": "structure.txt", "contents": "contents.md"}

SCHEMA_VERSION = 1
HASH_CHARS = 10
ANSWER_TTL_DAYS = 30

REPO_PART_RE = re.compile(r"^[a-z0-9._-]+$")

# ==============================================================================
# PATHS
# ==============================================================================


def repo_parts(repo):
    text = repo.strip().strip("/")
    parts = [part for part in text.split("/") if part]
    if len(parts) < 2:
        raise CliError(message("error.repo.format", repo=repo))
    if any(part in (".", "..") for part in parts):
        raise CliError(message("error.repo.segment", repo=repo))
    parts = [part.lower() for part in parts]
    if not all(REPO_PART_RE.match(part) for part in parts):
        raise CliError(message("error.repo.chars", repo=repo))
    return parts[0], "/".join(parts[1:])


def repo_name(repo):
    owner, name = repo_parts(repo)
    return f"{owner}/{name}"


def wiki_dir(repo):
    owner, name = repo_parts(repo)
    return CACHE_ROOT / "wiki" / owner / name


def answer_dir(repo, digest):
    owner, name = repo_parts(repo)
    return CACHE_ROOT / "answers" / owner / name / digest


def request_digest(primary, related, question):
    # canonical input, so a change of case or spacing keeps the same directory
    canonical = json.dumps(
        {
            "primary": repo_name(primary),
            "related": sorted({repo_name(repo) for repo in related}),
            "question": " ".join(question.split()).lower(),
        },
        sort_keys=True,
        separators=(",", ":"),
    )
    return hashlib.sha256(canonical.encode("utf-8")).hexdigest()[:HASH_CHARS]


# ==============================================================================
# FILES
# ==============================================================================


def timestamp():
    return time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())


def write_atomic(target, text):
    target.parent.mkdir(parents=True, exist_ok=True)
    temp_path = None
    try:
        with tempfile.NamedTemporaryFile(
            "w", dir=target.parent, delete=False, encoding="utf-8"
        ) as handle:
            temp_path = Path(handle.name)
            handle.write(text)
            if not text.endswith("\n"):
                handle.write("\n")
        os.replace(temp_path, target)
    except BaseException:
        # a half-written file must never pass for a cached answer
        if temp_path is not None:
            temp_path.unlink(missing_ok=True)
        raise


def write_json(target, payload):
    write_atomic(target, json.dumps(payload, indent=2, sort_keys=True))


def read_json(target):
    return json.loads(target.read_text(encoding="utf-8"))


def read_json_or_none(target):
    try:
        return read_json(target)
    except (OSError, ValueError):
        return None


def is_fresh(record, ttl_days):
    """True when the stamp is readable and younger than ttl_days."""
    try:
        fetched = time.strptime(record.get("fetched_at", ""), "%Y-%m-%dT%H:%M:%SZ")
    except (AttributeError, TypeError, ValueError):
        return False
    return (time.time() - calendar.timegm(fetched)) < ttl_days * 86400


# ==============================================================================
# ANSWER PAIR
# ==============================================================================


def read_request(primary, digest):
    # a pair is complete only when the json exists and its answer is on disk
    target = answer_dir(primary, digest)
    record = read_json_or_none(target / REQUEST_FILE)
    if not record or record.get("schema") != SCHEMA_VERSION:
        return None
    if not is_fresh(record, ANSWER_TTL_DAYS):
        return None
    try:
        return record, (target / ANSWER_FILE).read_text(encoding="utf-8")
    except OSError:
        # the json is written last, so a missing answer means a broken pair
        return None


def write_request(primary, digest, record, answer):
    target = answer_dir(primary, digest)
    write_atomic(target / ANSWER_FILE, answer)
    write_json(target / REQUEST_FILE, record)


# ==============================================================================
# WIKI
# ==============================================================================


def read_contents(repo):
    path = wiki_dir(repo) / WIKI_FILE["contents"]
    if not path.exists():
        raise CliError(message("error.wiki.missing", path=path, repo=repo))
    try:
        return path.read_text(encoding="utf-8")
    except OSError as error:
        raise CliError(message("error.cache", path=path, error=error)) from error


def update_meta(repo, kind, lines, chars):
    path = wiki_dir(repo) / META_FILE
    meta = read_json_or_none(path) or {"repo": repo_name(repo), "artifacts": {}}
    meta["artifacts"][kind] = {
        "fetched_at": timestamp(),
        "lines": lines,
        "chars": chars,
    }
    write_json(path, meta)
