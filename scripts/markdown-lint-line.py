#!/usr/bin/env python3
"""Report Markdown lines longer than a selected character count."""

import argparse
import re
import sys
from dataclasses import dataclass
from pathlib import Path

# --- constants ---------------------------------------------------------

FENCE_RE = re.compile(r"^ {0,3}(?P<marker>`{3,}|~{3,})(?P<tail>.*)$")
TABLE_CELL_RE = re.compile(r"^:?-{3,}:?$")
REPORT_GUIDANCE = """\
it skips tables, changes no files, and lists each issue as `line: characters`;
when editing prose, use `,` for a continuing clause or `.` for a completed sentence.
"""


@dataclass(frozen=True)
class Violation:
    line: int
    characters: int


# --- Markdown states ---------------------------------------------------

def fence_match(line: str) -> re.Match[str] | None:
    return FENCE_RE.match(line)


def closes_fence(line: str, marker: str) -> bool:
    match = fence_match(line)
    if not match:
        return False
    closing = match.group("marker")
    return (
        closing[0] == marker[0]
        and len(closing) >= len(marker)
        and not match.group("tail").strip()
    )


def is_table_delimiter(line: str) -> bool:
    if "|" not in line:
        return False
    text = line.strip()
    if text.startswith("|"):
        text = text[1:]
    if text.endswith("|"):
        text = text[:-1]
    cells = [cell.strip() for cell in text.split("|")]
    return bool(cells) and all(TABLE_CELL_RE.fullmatch(cell) for cell in cells)


def is_table_header(lines: list[str], index: int) -> bool:
    return (
        index + 1 < len(lines)
        and "|" in lines[index]
        and is_table_delimiter(lines[index + 1])
    )


def table_end(lines: list[str], start: int) -> int:
    index = start + 2
    while index < len(lines) and lines[index].strip() and "|" in lines[index]:
        index += 1
    return index


# --- linting -----------------------------------------------------------

def find_violations(lines: list[str], width: int) -> list[Violation]:
    violations: list[Violation] = []
    fence: str | None = None
    index = 0

    while index < len(lines):
        line = lines[index]
        if fence is not None:
            characters = len(line)
            if characters > width:
                violations.append(Violation(index + 1, characters))
            if closes_fence(line, fence):
                fence = None
            index += 1
            continue

        opening = fence_match(line)
        if opening:
            fence = opening.group("marker")
            characters = len(line)
            if characters > width:
                violations.append(Violation(index + 1, characters))
            index += 1
            continue

        if is_table_header(lines, index):
            index = table_end(lines, index)
            continue

        characters = len(line)
        if characters > width:
            violations.append(Violation(index + 1, characters))
        index += 1

    return violations


# --- output ------------------------------------------------------------

def print_report(
    reports: list[tuple[Path, list[Violation]]], width: int
) -> int:
    total = sum(len(violations) for _, violations in reports)
    if total == 0:
        print("ok")
        return 0

    print(f"this check reports Markdown lines longer than {width} characters.")
    print(REPORT_GUIDANCE, end="")
    print()

    for path, violations in reports:
        print(path)
        for violation in violations:
            print(f"- {violation.line}: {violation.characters}")
        print()

    files = len(reports)
    line_word = "line" if total == 1 else "lines"
    file_word = "file" if files == 1 else "files"
    verb = "exceeds" if total == 1 else "exceed"
    print(f"{total} {line_word} {verb} {width} characters in {files} {file_word}.")
    return 0


# --- cli ---------------------------------------------------------------

def parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="report Markdown lines longer than a selected character count"
    )
    parser.add_argument("--width", type=int, required=True)
    parser.add_argument("paths", nargs="+")
    args = parser.parse_args(argv)
    if args.width < 1:
        parser.error("--width must be positive")
    return args


def main(argv: list[str] | None = None) -> int:
    args = parse_args(argv)
    paths = [Path(value) for value in args.paths]
    for path in paths:
        if path.suffix != ".md":
            print(f"{path}: expected a .md file", file=sys.stderr)
            return 2

    reports: list[tuple[Path, list[Violation]]] = []
    for path in paths:
        try:
            lines = path.read_text(encoding="utf-8").splitlines()
        except (OSError, UnicodeError) as error:
            print(f"{path}: {error}", file=sys.stderr)
            return 2
        violations = find_violations(lines, args.width)
        if violations:
            reports.append((path, violations))

    return print_report(reports, args.width)


if __name__ == "__main__":
    raise SystemExit(main())
