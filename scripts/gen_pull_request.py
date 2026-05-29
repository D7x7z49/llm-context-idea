#!/usr/bin/env python3
# scripts/gen_pull_request.py

import re
import argparse
import subprocess
from pathlib import Path


TMP_ROOT = Path.cwd() / "tmp"

TARGET_PR_PATH = TMP_ROOT / "pr.md"
CONSUMED_PR_PATH = TMP_ROOT / "pr.consumed.md"


def parse_args():
    parser = argparse.ArgumentParser(description="Create a PR from ./tmp/pr.md using gh CLI.")
    parser.add_argument("--base", required=True, help="Target branch")
    parser.add_argument("--head", required=True, help="Source branch")
    parser.add_argument("--dry-run", action="store_true", help="Print what would be done without creating the PR")
    return parser.parse_args()


ALLOWED_TYPES = ("feat", "fix", "docs", "style", "refactor", "perf", "test", "build", "ci", "chore", "revert")

TITLE_RE = re.compile(
    r"^(" + "|".join(ALLOWED_TYPES) + r")"
    r"(\([^)]*\))?"  # optional scope
    r"!?"  # optional breaking change
    r":\s+"  # colon and space(s)
    r"(.+)$"  # summary
)

MOTIVATION_MARKER = "MOTIVATION"
REFERENCES_MARKER = "REFERENCES"


def parse_content(content: list[str]) -> tuple[str, str]:
    title: str | None = None
    motivation: list[str] = []
    references: list[str] = []

    status = "title"
    for line in content:
        text = line.strip()

        if status == "title":
            if not text:
                continue
            if not TITLE_RE.match(text):
                exit("[!] invalid title, see <./prompt/gh/PR/pull-request.md>")
            title = text
            status = "body"
            continue

        if status == "body":
            if text == MOTIVATION_MARKER:
                status = "motivation"
                continue
            continue

        if status == "motivation":
            if text == REFERENCES_MARKER:
                status = "references"
                continue
            if text:
                motivation.append(line.rstrip("\n"))
            continue

        if status == "references":
            if text:
                references.append(line.rstrip("\n"))
            continue

    else:
        if len(motivation) == 0:
            exit("[!] missing motivation section")

        option = ["\n", REFERENCES_MARKER, *references] if references else []
        body = "\n".join([MOTIVATION_MARKER, *motivation, *option])
        if title and body:
            return title, body

    exit("[!] unknown content format")


def call_gh(title, body, base, head):
    cmd = ["gh", "pr", "create", "--title", title, "--body", body, "--base", base, "--head", head]
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        exit(f"[!] gh pr create failed:\n{result.stderr.strip()}")

    return result.stdout.strip()


def main():
    args = parse_args()
    print(f"[-] branch [{args.base}] <- [{args.head}]")
    print(f"[-] [dry-run mode ({'on' if args.dry_run else 'off'})]")

    if not TARGET_PR_PATH.exists():
        exit(f"[!] missing <{TARGET_PR_PATH}>")

    content = TARGET_PR_PATH.read_text().splitlines()
    title, body = parse_content(content)

    if not args.dry_run:
        output = call_gh(title, body, args.base, args.head)
    else:
        output = f"gh pr create --title {title!r} --body {body!r} --base {args.base} --head {args.head}"

    data = output.splitlines()
    if len(data) > 1:
        output = f"\n{' ' * 4}".join(data)
        print(f"[+] successfully created PR.\n{output}")
    print(f"[+] {output}")

    if not args.dry_run:
        TARGET_PR_PATH.rename(CONSUMED_PR_PATH)
    print(f"[+] renamed <{TARGET_PR_PATH}> -> <{CONSUMED_PR_PATH}>")


if __name__ == "__main__":
    main()
