#!/usr/bin/env python3
# @path[pi/skills/rule-writing/scripts/lint_rules.py]
# check one rule file for its header, sections, budget, lines, and pointers.
#
# usage
#   python3 scripts/lint_rules.py <file.md>
#
# exit codes
#   0 file passes, warnings allowed
#   1 finding reported
#   2 usage error
#   3 io error

import argparse
import re
import sys
from dataclasses import dataclass, field
from pathlib import Path

# ==============================================================================
# CONSTANTS
# ==============================================================================

EXIT_OK = 0
EXIT_FINDING = 1
EXIT_USAGE = 2
EXIT_IO = 3

LINE_LIMIT = 64
SECTION_LIMIT = 9
ITEM_RANGE = (5, 9)
ITEM_CHAR_LIMIT = 120
HEADER_LINES = 2

FILE_SUFFIX = ".md"
RULE_FENCE = "---"

LEVEL_ERROR = "error"
LEVEL_WARN = "warn"
LEVEL_NOTE = "note"

NOTE_RE = re.compile(r"^<!--\s*NOTE:\s*\S.*-->$")
COMMENT_RE = re.compile(r"^<!--\s*(\S.*?)\s*-->$")
SECTION_RE = re.compile(r"^[A-Z][A-Z0-9 &/+_-]*$")
ITEM_RE = re.compile(r"^( *)-\s+(.*)$")
FENCE_RE = re.compile(r"^ {0,3}(`{3,}|~{3,})")
LINK_RE = re.compile(r"\[[^\]]*\]\(([^)\s]+)\)")
ABBREV_RE = re.compile(r"\b([A-Z]{2,})\b")
WORD_RE = re.compile(r"([A-Za-z][\w-]*)")
NEGATION_RE = re.compile(r"^(avoid|do not|don't|never|no)\b", re.I)
TARGET_HINT_RE = re.compile(
    r"\b(because|when|before|after|only|unless|instead|until|if|target)\b",
    re.I,
)
INLINE_CODE_RE = re.compile(r"`[^`]*`")
RULE_KEY_RE = re.compile(r"[^a-z0-9 ]")

# a structural glyph that a mainstream input method may not type directly
EXOTIC_GLYPHS = "→←⇒≥≤≠≈—–…“”‘’•·×÷"

MESSAGES = {
    "cli.run.description": "check one rule file for form, budget, and pointers",
    "cli.run.path_help": "rule file to check",
    "usage.file.invalid": "path must be a markdown file at [{path}]",
    "io.read.file": "cannot read [{path}] because of {error}",
    "header.empty": (
        "the file is empty, a rule set needs a note line and one section"
    ),
    "header.note": (
        "open the file with a note line, a reader lands better with a signpost"
    ),
    "file.crlf": "use LF line endings, the repository form is LF",
    "file.newline": (
        "the file does not end with a newline, one more byte closes the last block"
    ),
    "file.lines": (
        "line budget, [{count}] lines over [{max}], cut one repeat "
        "and the whole set stays in view"
    ),
    "section.none": (
        "no section found, open with an uppercase name and keep one concept "
        "per section"
    ),
    "section.limit": (
        "section budget, [{count}] sections over [{max}], fold two sections "
        "together and keep the whole in view"
    ),
    "section.repeat": (
        "section [{name}] repeats line [{line}], one name, one home"
    ),
    "section.items.max": (
        "item budget, [{name}] holds [{count}] items over [{max}], move one "
        "detail into a reference file"
    ),
    "section.items.min": (
        "shape, [{names}] under the comfort window [{min}] to [{max}], fold "
        "one into a neighbour when the moment comes"
    ),
    "item.capital": (
        "start the rule in lowercase, a term and a marker keep their uppercase"
    ),
    "item.negation": (
        "a negation is easier to verify with its positive target named, "
        "state the target or mark [pending]"
    ),
    "item.long": (
        "this rule runs [{count}] characters, split the concepts and each one "
        "gets stronger"
    ),
    "item.repeat": (
        "this rule repeats line [{line}], one concept, one line, double the clarity"
    ),
    "item.outside": "this rule sits outside a section, name the section first",
    "item.indent": (
        "keep one item on one line, nest a level only with paired delimiters"
    ),
    "shape.pair": (
        "a paired delimiter lost its partner [{pair}], close the shape so the "
        "branch is clear"
    ),
    "shape.term": (
        "a term lost its closing backtick, pair the mark so the shape reads"
    ),
    "glyph.exotic": (
        "the glyph [{glyph}] may not come from every keyboard, a plain key or "
        "a short word travels better"
    ),
    "term.abbrev": (
        "expand [{token}] at its first occurrence, a short gloss keeps a peer "
        "in the loop"
    ),
    "line.heading": (
        "a heading is a rare exception, keep the file flat so the set stays "
        "scannable"
    ),
    "line.free": (
        "free text sits outside a rule, move the narrative into a reference file"
    ),
    "line.trailing": "trim the trailing space, a clean line reads faster",
    "line.tab": (
        "replace the tab with spaces, the shape should not depend on a tab stop"
    ),
    "link.missing": (
        "pointer [{target}] does not resolve, fix the path and the substance "
        "stays reachable"
    ),
    "report.finding": "[{path}] line [{line}] [{level}] {text}",
    "report.finding.noline": "[{path}] [{level}] {text}",
    "report.ok": (
        "[{path}] ok, [{sections}] sections, [{rules}] rules, [{lines}] lines, "
        "[{links}] pointers"
    ),
    "report.summary": "errors [{errors}], warns [{warns}], notes [{notes}]",
    "report.tail.fix": (
        "start with the first finding, each one is a small edit. a rule set "
        "is a shared promise, every fix makes the promise easier to keep"
    ),
    "report.tail.warn": (
        "the form holds, polish a warn when the moment is right. a peer can "
        "restate this rule set without the file"
    ),
    "report.tail.note": (
        "no blocker, take a note when the moment is right. the universe is "
        "named, the target set is finite, and the budget holds, keep going"
    ),
    "report.tail.ok": (
        "the universe is named, the target set is finite, and the budget "
        "holds, keep going. a peer can restate this rule set without the file"
    ),
}


# ==============================================================================
# TYPES
# ==============================================================================


@dataclass
class RuleSection:
    name: str
    line: int
    items: list[int] = field(default_factory=list)


@dataclass
class RuleFinding:
    level: str
    line: int
    text: str


@dataclass
class RuleReport:
    path: Path
    lines: int = 0
    sections: list[RuleSection] = field(default_factory=list)
    findings: list[RuleFinding] = field(default_factory=list)
    links: int = 0

    def add(self, level: str, line_no: int, key: str, **values: object) -> None:
        text = message(key, **values)
        self.findings.append(RuleFinding(level=level, line=line_no, text=text))

    def count(self, level: str) -> int:
        return sum(1 for finding in self.findings if finding.level == level)

    def rule_count(self) -> int:
        return sum(len(section.items) for section in self.sections)


# ==============================================================================
# HELPERS
# ==============================================================================


def message(key: str, **values: object) -> str:
    return MESSAGES[key].format(**values)


def body_start(lines: list[str]) -> int:
    # skip the yaml front matter when it is present
    if not lines or lines[0].strip() != RULE_FENCE:
        return 0
    for index in range(1, len(lines)):
        if lines[index].strip() == RULE_FENCE:
            return index + 1
    return 0


def strip_code(text: str) -> str:
    return INLINE_CODE_RE.sub("", text)


# ==============================================================================
# FILE CHECKS
# ==============================================================================


def check_header(report: RuleReport, body: list[str], offset: int) -> None:
    head = [
        (offset + index + 1, line.strip())
        for index, line in enumerate(body)
        if line.strip()
    ][:HEADER_LINES]
    if not head:
        report.add(LEVEL_WARN, offset + 1, "header.empty")
        return
    if not any(NOTE_RE.match(line) for _, line in head):
        report.add(LEVEL_WARN, head[0][0], "header.note")


def check_links(report: RuleReport, text: str, base: Path, line_no: int) -> None:
    for target in LINK_RE.findall(strip_code(text)):
        report.links += 1
        # leave external targets alone
        if target.startswith(("http://", "https://", "#", "mailto:")):
            continue
        if not (base / target).exists():
            report.add(LEVEL_ERROR, line_no, "link.missing", target=target)


def check_file(path: Path) -> RuleReport:
    text = path.read_text(encoding="utf-8")
    lines = text.splitlines()
    report = RuleReport(path=path, lines=len(lines))

    if "\r\n" in text:
        report.add(LEVEL_WARN, 0, "file.crlf")
    if text and not text.endswith("\n"):
        report.add(LEVEL_ERROR, report.lines, "file.newline")
    if report.lines > LINE_LIMIT:
        report.add(
            LEVEL_ERROR,
            report.lines,
            "file.lines",
            count=report.lines,
            max=LINE_LIMIT,
        )

    offset = body_start(lines)
    body = lines[offset:]
    check_header(report, body, offset)

    section: RuleSection | None = None
    fence: str | None = None
    seen_rules: dict[str, int] = {}
    seen_abbrev: set[str] = set()
    for index, raw in enumerate(body):
        line_no = offset + index + 1
        line = raw.rstrip()
        stripped = line.strip()

        # ignore fenced code, it is not rule text
        if fence is not None:
            closing = FENCE_RE.match(line)
            if closing and closing.group(1)[0] == fence[0]:
                fence = None
            continue
        opening = FENCE_RE.match(line)
        if opening:
            fence = opening.group(1)
            continue

        if not stripped:
            continue
        if line != raw:
            report.add(LEVEL_WARN, line_no, "line.trailing")
        if "\t" in raw:
            report.add(LEVEL_WARN, line_no, "line.tab")
        if stripped == RULE_FENCE:
            section = None
            continue
        if COMMENT_RE.match(stripped):
            continue
        if stripped.startswith("#"):
            report.add(LEVEL_WARN, line_no, "line.heading")
            continue

        item = ITEM_RE.match(line)
        if item:
            indent, text_body = item.groups()
            if section is None:
                report.add(LEVEL_WARN, line_no, "item.outside")
            else:
                section.items.append(line_no)
            if indent:
                report.add(LEVEL_WARN, line_no, "item.indent")
            check_item(report, text_body, line_no, seen_rules, seen_abbrev)
            check_links(report, text_body, path.parent, line_no)
            continue

        if SECTION_RE.match(stripped) and len(stripped) > 1:
            section = RuleSection(name=stripped, line=line_no)
            report.sections.append(section)
            continue

        report.add(LEVEL_WARN, line_no, "line.free")
        check_links(report, stripped, path.parent, line_no)

    check_sections(report)
    return report


# ==============================================================================
# ITEM CHECKS
# ==============================================================================


def check_delimiters(report: RuleReport, text: str, line_no: int) -> None:
    bare = strip_code(text)
    for opener, closer in (("(", ")"), ("[", "]"), ("{", "}")):
        if bare.count(opener) != bare.count(closer):
            report.add(LEVEL_WARN, line_no, "shape.pair", pair=opener + closer)
    if text.count("`") % 2:
        report.add(LEVEL_WARN, line_no, "shape.term")


def check_glyphs(report: RuleReport, text: str, line_no: int) -> None:
    for char in text:
        if char in EXOTIC_GLYPHS:
            report.add(LEVEL_WARN, line_no, "glyph.exotic", glyph=char)


def check_abbrev(
    report: RuleReport, text: str, line_no: int, seen: set[str]
) -> None:
    # report a token once per file
    for token in ABBREV_RE.findall(strip_code(text)):
        if token in seen:
            continue
        seen.add(token)
        report.add(LEVEL_WARN, line_no, "term.abbrev", token=token)


def check_item(
    report: RuleReport,
    text: str,
    line_no: int,
    seen_rules: dict[str, int],
    seen_abbrev: set[str],
) -> None:
    token = WORD_RE.match(text)
    if token and token.group(1)[0].isupper() and not token.group(1).isupper():
        report.add(LEVEL_WARN, line_no, "item.capital")
    if NEGATION_RE.match(text) and not TARGET_HINT_RE.search(text):
        report.add(LEVEL_WARN, line_no, "item.negation")
    if len(text) > ITEM_CHAR_LIMIT:
        report.add(LEVEL_WARN, line_no, "item.long", count=len(text))

    # compare normalized text so punctuation does not hide a repeat
    key = " ".join(RULE_KEY_RE.sub("", text.lower()).split())
    if key and key in seen_rules:
        report.add(LEVEL_WARN, line_no, "item.repeat", line=seen_rules[key])
    else:
        seen_rules[key] = line_no

    check_delimiters(report, text, line_no)
    check_glyphs(report, text, line_no)
    check_abbrev(report, text, line_no, seen_abbrev)


# ==============================================================================
# SECTION CHECKS
# ==============================================================================


def check_sections(report: RuleReport) -> None:
    if not report.sections:
        report.add(LEVEL_ERROR, 1, "section.none")
        return
    if len(report.sections) > SECTION_LIMIT:
        report.add(
            LEVEL_ERROR,
            report.sections[0].line,
            "section.limit",
            count=len(report.sections),
            max=SECTION_LIMIT,
        )

    names: dict[str, int] = {}
    short: list[str] = []
    min_items, max_items = ITEM_RANGE
    for section in report.sections:
        if section.name in names:
            report.add(
                LEVEL_WARN,
                section.line,
                "section.repeat",
                name=section.name,
                line=names[section.name],
            )
        names.setdefault(section.name, section.line)

        count = len(section.items)
        if count > max_items:
            report.add(
                LEVEL_ERROR,
                section.line,
                "section.items.max",
                name=section.name,
                count=count,
                max=max_items,
            )
        elif count < min_items:
            short.append(section.name)

    # keep short sections as a note, not a blocker
    if short:
        report.add(
            LEVEL_NOTE,
            report.sections[0].line,
            "section.items.min",
            names=", ".join(short),
            min=min_items,
            max=max_items,
        )


# ==============================================================================
# REPORTING
# ==============================================================================


def print_report(report: RuleReport) -> int:
    for finding in report.findings:
        if finding.line:
            text = message(
                "report.finding",
                path=report.path,
                line=finding.line,
                level=finding.level,
                text=finding.text,
            )
        else:
            text = message(
                "report.finding.noline",
                path=report.path,
                level=finding.level,
                text=finding.text,
            )
        print(text)

    errors = report.count(LEVEL_ERROR)
    warns = report.count(LEVEL_WARN)
    notes = report.count(LEVEL_NOTE)

    if not report.findings:
        print(
            message(
                "report.ok",
                path=report.path,
                sections=len(report.sections),
                rules=report.rule_count(),
                lines=report.lines,
                links=report.links,
            )
        )
        print(message("report.tail.ok"))
        return EXIT_OK

    print(message("report.summary", errors=errors, warns=warns, notes=notes))
    if errors:
        print(message("report.tail.fix"))
        return EXIT_FINDING
    if warns:
        print(message("report.tail.warn"))
        return EXIT_OK
    print(message("report.tail.note"))
    return EXIT_OK


# ==============================================================================
# COMMAND LINE
# ==============================================================================


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=message("cli.run.description"))
    parser.add_argument("path", type=Path, help=message("cli.run.path_help"))
    args = parser.parse_args(argv)

    if args.path.suffix != FILE_SUFFIX:
        print(message("usage.file.invalid", path=args.path), file=sys.stderr)
        return EXIT_USAGE

    try:
        report = check_file(args.path)
    except (OSError, UnicodeError) as error:
        print(
            message("io.read.file", path=args.path, error=error),
            file=sys.stderr,
        )
        return EXIT_IO
    return print_report(report)


if __name__ == "__main__":
    raise SystemExit(main())
