#!/usr/bin/env python3
# pi/skills/fetch-deepseek-share/scripts/fetch.py
# download one DeepSeek share response and save the raw JSON.

import argparse
import json
import os
import re
import sys
import tempfile
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

API_URL = "https://chat.deepseek.com/api/v0/share/content?share_id={share_id}"
DATA_DIR = Path.home() / ".agent" / "cache" / "deepseek-share"
SHARE_ID_RE = re.compile(r"^[a-z0-9]{8,32}$")
RETRY_STATUS = {429, 500, 502, 503, 504}
MAX_ATTEMPTS = 3
RETRY_DELAY = 1.0
TIMEOUT = 30

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 "
        "(KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36"
    ),
    "Accept": "*/*",
    "Origin": "https://chat.deepseek.com",
    "x-client-platform": "web",
}


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
        raise ValueError(
            f"share id must be 8 to 32 lowercase letters or digits: {value}"
        )
    return text


def fetch(share_id):
    url = API_URL.format(share_id=share_id)
    headers = dict(HEADERS)
    headers["Referer"] = f"https://chat.deepseek.com/share/{share_id}"
    message = "fetch failed"

    for attempt in range(MAX_ATTEMPTS):
        request = urllib.request.Request(url, headers=headers)
        try:
            with urllib.request.urlopen(request, timeout=TIMEOUT) as response:
                return response.read()
        except urllib.error.HTTPError as error:
            body = error.read()[:200].decode("utf-8", "replace")
            message = f"HTTP {error.code}: {body}"
            if error.code not in RETRY_STATUS:
                raise RuntimeError(message) from error
        except urllib.error.URLError as error:
            message = f"network error: {error.reason}"

        if attempt + 1 == MAX_ATTEMPTS:
            break
        time.sleep(RETRY_DELAY * (2 ** attempt))

    raise RuntimeError(message)


def validate(raw):
    try:
        payload = json.loads(raw)
    except json.JSONDecodeError as error:
        raise RuntimeError(f"response is not JSON: {error}") from error

    if payload.get("code") != 0:
        reason = payload.get("msg") or "unknown error"
        raise RuntimeError(f"share request failed: {reason}")

    data = payload.get("data") or {}
    biz_data = data.get("biz_data") or {}
    if not biz_data.get("messages"):
        raise RuntimeError("share has no messages")


def write_atomic(target, raw):
    target.parent.mkdir(parents=True, exist_ok=True)
    temp_path = None
    try:
        with tempfile.NamedTemporaryFile(
            dir=target.parent, delete=False
        ) as handle:
            temp_path = Path(handle.name)
            handle.write(raw)
        os.replace(temp_path, target)
    except BaseException:
        if temp_path is not None:
            temp_path.unlink(missing_ok=True)
        raise


def main():
    parser = argparse.ArgumentParser(
        description="Fetch a DeepSeek shared conversation as raw JSON."
    )
    parser.add_argument("target", help="share id or share URL")
    parser.add_argument(
        "--refresh",
        action="store_true",
        help="fetch again even when the file already exists",
    )
    args = parser.parse_args()

    try:
        share_id = parse_share_id(args.target)
        target = DATA_DIR / f"{share_id}.json"
        if args.refresh or not target.exists():
            raw = fetch(share_id)
            validate(raw)
            write_atomic(target, raw)
    except (ValueError, RuntimeError) as error:
        print(f"error: {error}", file=sys.stderr)
        return 1

    print(target.resolve())
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
