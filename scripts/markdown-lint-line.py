#!/usr/bin/env python3
"""Report Markdown line breaks that do not follow punctuation."""

import argparse
import re
import sys
from dataclasses import dataclass
from pathlib import Path

FENCE_RE = re.compile(r"^ {0,3}(?P<marker>`{3,}|~{3,})(?P<tail>.*)$")
TABLE_CELL_RE = re.compile(r"^:?-{3,}:?$")
HEADING_RE = re.compile(r"^ {0,3}#{1,6}(?:\s|$)")
LIST_RE = re.compile(
    r"^(?P<indent> *)(?P<marker>(?:[-+*]|\d+[.)]))[ \t]+(?P<content>.*)$"
)
QUOTE_RE = re.compile(r"^(?P<prefix>(?: {0,3}>[ \t]?)+)(?P<rest>.*)$")

WRAP_PUNCTUATION = {",", ".", "?", "!", "，", "。", "？", "！"}
CLOSING_MARKS = "`*_~)]}\"'”’»】）》"
GUIDANCE = """\
it skips fenced code, tables, headings, blank lines, and block boundaries;
it changes no files and reports each issue as `first-second: reason`.
"""


@dataclass(frozen=True)
class Line:
    number: int
    content: str
    quote_depth: int
    indent: int
    list_start: bool
    list_indent: int | None


@dataclass(frozen=True)
class Violation:
    first_line: int
    second_line: int


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


def parse_line(number: int, raw: str) -> Line:
    text = raw.rstrip("\r\n")
    quote_match = QUOTE_RE.match(text)
    if quote_match:
        prefix = quote_match.group("prefix")
        rest = quote_match.group("rest")
        quote_depth = prefix.count(">")
    else:
        rest = text
        quote_depth = 0

    indent = len(rest) - len(rest.lstrip(" "))
    body = rest[indent:]
    list_match = LIST_RE.match(rest)
    list_start = list_match is not None
    list_indent = len(list_match.group("indent")) if list_match else None
    if list_match:
        body = list_match.group("content").strip()

    return Line(
        number=number,
        content=body,
        quote_depth=quote_depth,
        indent=indent,
        list_start=list_start,
        list_indent=list_indent,
    )


def last_visible_character(text: str) -> str:
    text = text.rstrip()
    while text and text[-1] in CLOSING_MARKS:
        text = text[:-1].rstrip()
    return text[-1:] if text else ""


def same_block(previous: Line, current: Line) -> bool:
    if previous.quote_depth != current.quote_depth:
        return False
    if current.list_start:
        return False
    if previous.list_start:
        return current.indent >= (previous.list_indent or 0) + 2
    return current.indent >= previous.indent


def inspect_boundary(previous: Line, current: Line) -> Violation | None:
    if not previous.content or not current.content:
        return None
    if last_visible_character(previous.content) in WRAP_PUNCTUATION:
        return None
    return Violation(previous.number, current.number)


def find_violations(lines: list[str]) -> list[Violation]:
    violations: list[Violation] = []
    previous: Line | None = None
    fence: str | None = None
    frontmatter = False
    frontmatter_done = False
    index = 0

    while index < len(lines):
        raw = lines[index]
        stripped = raw.strip()

        if not frontmatter_done and index == 0 and stripped == "---":
            frontmatter = True
            previous = None
            index += 1
            continue
        if frontmatter:
            previous = None
            if stripped in {"---", "..."}:
                frontmatter = False
                frontmatter_done = True
            index += 1
            continue

        if fence is not None:
            previous = None
            if closes_fence(raw, fence):
                fence = None
            index += 1
            continue

        opening = fence_match(raw)
        if opening:
            previous = None
            fence = opening.group("marker")
            index += 1
            continue

        if is_table_header(lines, index):
            previous = None
            index = table_end(lines, index)
            continue

        if not stripped or HEADING_RE.match(raw):
            previous = None
            index += 1
            continue

        current = parse_line(index + 1, raw)
        if previous is not None and same_block(previous, current):
            violation = inspect_boundary(previous, current)
            if violation is not None:
                violations.append(violation)

        previous = current
        index += 1

    return violations


def print_report(
    reports: list[tuple[Path, list[Violation]]]
) -> int:
    total = sum(len(violations) for _, violations in reports)
    if total == 0:
        print("ok")
        return 0

    print("this check reports Markdown line breaks that do not follow punctuation.")
    print(GUIDANCE, end="")
    print()

    for path, violations in reports:
        print(path)
        for violation in violations:
            print(
                f"- {violation.first_line}-{violation.second_line}: "
                "line break does not follow punctuation"
            )
        print()

    files = len(reports)
    boundary_word = "boundary" if total == 1 else "boundaries"
    file_word = "file" if files == 1 else "files"
    print(f"{total} wrap {boundary_word} reported in {files} {file_word}.")
    return 0


def parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="report Markdown line breaks that do not follow punctuation"
    )
    parser.add_argument("paths", nargs="+")
    args = parser.parse_args(argv)
    for value in args.paths:
        if Path(value).suffix != ".md":
            parser.error(f"{value}: expected a .md file")
    return args


def main(argv: list[str] | None = None) -> int:
    args = parse_args(argv)
    reports: list[tuple[Path, list[Violation]]] = []
    for value in args.paths:
        path = Path(value)
        try:
            lines = path.read_text(encoding="utf-8").splitlines()
        except (OSError, UnicodeError) as error:
            print(f"{path}: {error}", file=sys.stderr)
            return 2
        violations = find_violations(lines)
        if violations:
            reports.append((path, violations))
    return print_report(reports)


if __name__ == "__main__":
    raise SystemExit(main())
