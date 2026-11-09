# @path[pi/skills/fetch-deepseek-share/scripts/deepseek_cli/share.py]
# a cached share on disk: paths, atomic files, and the markdown section view.

import hashlib
import json
import os
import re
import tempfile
from pathlib import Path

from .messages import ShareError, message

# ==============================================================================
# CONSTANTS
# ==============================================================================

DATA_DIR = Path.home() / ".agents" / ".cache" / "deepseek-share"

TIP = "TIP"
FILE = "FILE"

HEADER_OPEN = "<!-- ["
HEADER_CLOSE = "] -->"
DIGEST_RE = re.compile(r"^[0-9a-f]{7}$")

# ==============================================================================
# PATHS AND FILES
# ==============================================================================


def json_path(share_id):
    return DATA_DIR / f"{share_id}.json"


def view_path(share_id):
    return DATA_DIR / f"{share_id}.md"


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
        # a half-written file must never pass for a cached share
        if temp_path is not None:
            temp_path.unlink(missing_ok=True)
        raise


def load_payload(path):
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except (OSError, ValueError) as error:
        raise ShareError(
            message("error.cache.unreadable", path=path, error=error)
        ) from error


def payload_or_none(path):
    # fetch uses this to treat an unreadable cache as a miss and fetch again
    try:
        return load_payload(path)
    except ShareError:
        return None


# ==============================================================================
# SECTION VIEW
# ==============================================================================


def format_header(kind, number, digest):
    return f"{HEADER_OPEN}{kind}][{number:03d}][{digest}{HEADER_CLOSE}"


# format_header and parse_header own the one header shape; keep the pair together
def parse_header(line):
    if not (line.startswith(HEADER_OPEN) and line.endswith(HEADER_CLOSE)):
        return None
    body = line[len(HEADER_OPEN):-len(HEADER_CLOSE)]
    parts = body.split("][")
    if len(parts) != 3:
        return None
    kind, number, digest = parts
    if not kind.isupper() or not number.isdigit() or not DIGEST_RE.match(digest):
        return None
    return kind, int(number), digest


def fragment_text(fragment):
    if fragment.get("type") == FILE:
        names = [
            item.get("file_name", "") for item in fragment.get("files") or []
        ]
        return "\n".join(name for name in names if name)
    return fragment.get("content") or ""


def normalize(text):
    text = text.replace("\r\n", "\n").replace("\r", "\n")
    return text.strip("\n")


def build_view(messages):
    sections = []
    for number, message_data in enumerate(messages, 1):
        for fragment in message_data.get("fragments") or []:
            kind = fragment.get("type") or ""
            if kind == TIP:
                continue
            text = normalize(fragment_text(fragment))
            if not text:
                continue
            digest = hashlib.sha256(text.encode("utf-8")).hexdigest()[:7]
            sections.append(f"{format_header(kind, number, digest)}\n{text}")
    return "\n\n".join(sections)


def split_sections(text):
    sections = []
    current = None
    for line in text.split("\n"):
        if parse_header(line) is not None:
            if current is not None:
                sections.append("\n".join(current).rstrip("\n"))
            current = [line]
        elif current is not None:
            current.append(line)
    if current is not None:
        sections.append("\n".join(current).rstrip("\n"))
    return sections


def view_is_stale(json_file, view_file):
    return (
        not view_file.exists()
        or view_file.stat().st_mtime_ns < json_file.stat().st_mtime_ns
    )


def ensure_view(json_file, view_file, messages, rebuild):
    if not rebuild and not view_is_stale(json_file, view_file):
        return
    write_atomic(view_file, build_view(messages))


def message_text(messages, number):
    chunks = []
    for fragment in messages[number - 1].get("fragments") or []:
        if fragment.get("type") == TIP:
            continue
        text = normalize(fragment_text(fragment))
        if text:
            chunks.append(text)
    return "\n\n".join(chunks)
