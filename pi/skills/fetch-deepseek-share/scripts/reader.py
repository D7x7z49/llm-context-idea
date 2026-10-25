#!/usr/bin/env python3
# pi/skills/fetch-deepseek-share/scripts/reader.py
# print a cached DeepSeek share as one line per fragment.

import argparse
import hashlib
import json
import re
import sys

from fetch import DATA_DIR, parse_share_id, write_atomic

TIP = "TIP"
FILE = "FILE"
SECTION_RE = re.compile(r"^<!-- \[[A-Z]+\]\[\d{3,}\]\[[0-9a-f]{7}\] -->$")


def fragment_text(fragment):
    if fragment.get("type") == FILE:
        files = fragment.get("files") or []
        names = [item.get("file_name", "") for item in files]
        return "\n".join(name for name in names if name)
    return fragment.get("content") or ""


def normalize(text):
    text = text.replace("\r\n", "\n").replace("\r", "\n")
    return text.strip("\n")


def build_sections(payload):
    data = payload.get("data") or {}
    biz_data = data.get("biz_data") or {}
    messages = biz_data.get("messages") or []

    for number, message in enumerate(messages, 1):
        for fragment in message.get("fragments") or []:
            kind = fragment.get("type") or ""
            if kind == TIP:
                continue
            text = normalize(fragment_text(fragment))
            if not text:
                continue
            digest = hashlib.sha256(text.encode("utf-8")).hexdigest()[:7]
            header = f"<!-- [{kind}][{number:03d}][{digest}] -->"
            yield header, text


def load_json(path):
    with path.open(encoding="utf-8") as handle:
        return json.load(handle)


def ensure_markdown(json_path, md_path, rebuild):
    if (
        not rebuild
        and md_path.exists()
        and md_path.stat().st_mtime >= json_path.stat().st_mtime
    ):
        return
    payload = load_json(json_path)
    sections = [
        f"{header}\n{text}" for header, text in build_sections(payload)
    ]
    write_atomic(md_path, ("\n\n".join(sections) + "\n").encode("utf-8"))


def split_sections(text):
    sections = []
    current = None

    for line in text.split("\n"):
        if SECTION_RE.match(line):
            if current is not None:
                sections.append("\n".join(current).rstrip("\n"))
            current = [line]
        elif current is not None:
            current.append(line)

    if current is not None:
        sections.append("\n".join(current).rstrip("\n"))
    return sections


def read_sections(md_path, offset, limit):
    text = md_path.read_text(encoding="utf-8")
    sections = split_sections(text)
    if offset:
        sections = sections[offset:]
    if limit is not None:
        sections = sections[:limit]
    return sections


def show_message(payload, number):
    data = payload.get("data") or {}
    biz_data = data.get("biz_data") or {}
    messages = biz_data.get("messages") or []

    if not 1 <= number <= len(messages):
        raise ValueError(f"message number out of range: {number}")

    chunks = []
    for fragment in messages[number - 1].get("fragments") or []:
        if fragment.get("type") == TIP:
            continue
        text = fragment_text(fragment)
        if text:
            chunks.append(text)

    if not chunks:
        raise ValueError(f"message {number} has no content")
    return "\n\n".join(chunks)


def main():
    parser = argparse.ArgumentParser(
        description="Print a cached DeepSeek share one section per fragment."
    )
    parser.add_argument("share_id", help="share id or share URL")
    parser.add_argument(
        "number",
        nargs="?",
        type=int,
        help="message number to print in full",
    )
    parser.add_argument(
        "--offset", type=int, default=0, help="skip this many rows"
    )
    parser.add_argument(
        "--limit", type=int, help="print at most this many rows"
    )
    parser.add_argument(
        "--rebuild", action="store_true", help="rebuild the markdown view"
    )
    args = parser.parse_args()

    if args.number is not None and (args.offset or args.limit is not None):
        parser.error("--offset and --limit only apply to listing")

    try:
        share_id = parse_share_id(args.share_id)
        json_path = DATA_DIR / f"{share_id}.json"
        if not json_path.exists():
            raise RuntimeError(f"missing cache file: {json_path}")
        md_path = DATA_DIR / f"{share_id}.md"
        ensure_markdown(json_path, md_path, args.rebuild)

        if args.number is None:
            sections = read_sections(md_path, args.offset, args.limit)
            if sections:
                print("\n\n".join(sections))
        else:
            payload = load_json(json_path)
            print(show_message(payload, args.number))
    except (ValueError, RuntimeError, OSError, json.JSONDecodeError) as error:
        print(f"error: {error}", file=sys.stderr)
        return 1

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
