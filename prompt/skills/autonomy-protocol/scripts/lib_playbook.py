#!/usr/bin/env python3
# scripts/lib_playbook.py
# shared parser, checks, and formatting for playbook manuals.
# a manual file carries the .playbook suffix.
# lint_playbook.py and fmt_playbook.py import this module.

import re
import sys
from pathlib import Path

SKILL_DIR = Path(__file__).resolve().parent.parent
REFERENCES = SKILL_DIR / "references"

SUFFIX = ".playbook"

STATES = {"OBS", "REA", "ACT", "REF", "QUE", "INS"}
SELF = {"K", "U", "X"}
OTHER = {"EK", "EU", "AK", "AU", "X"}
MIN_ROWS = 3
MAX_ROWS = 7

ROW_RE = re.compile(r"^(\d{3}) ([A-Za-z]+) \s*\|\s*(.+?) \s*\|\s*(.+)$")
BRANCH_RE = re.compile(
    r"^[a-z][a-z-]* \d{3}(?: \| [a-z][a-z-]* \d{3})*$"
)
GOTO_RE = re.compile(r"\b([a-z][a-z-]*) (\d{3})\b")

# comment style, taken from the committed files under prompt/.
# a single line comment has no padding, a section banner is three lines
# (rule, padded title, rule), and a long note uses the block form.
BANNER_WIDTH = 80
BANNER_RULE = "(* " + "=" * 74 + " *)"
BANNER_SHAPE_RE = re.compile(r"^\(\*\s*=+\s*\*\)$")


class Row:
    def __init__(self, addr, label, op, branch, line_no):
        self.addr = addr
        self.label = label
        self.op = op.strip()
        self.branch = branch.strip()
        self.line_no = line_no


class Manual:
    def __init__(self, path):
        self.path = Path(path)
        self.lines = self.path.read_text().splitlines()
        self.rows = []
        self.errors = []
        self.warns = []
        self.addresses = set()
        self._parse()

    def _parse(self):
        in_comment = False
        for i, raw in enumerate(self.lines, 1):
            s = raw.strip()
            if in_comment:
                if s == "*)":
                    in_comment = False
                elif "*)" in s:
                    self.errors.append(
                        f"line {i}: block comment close must be alone"
                    )
                    in_comment = False
                continue
            if not s:
                continue
            if s.startswith("<!--"):
                if not s.endswith("-->"):
                    self.errors.append(f"line {i}: host marker is not closed")
                continue
            if s == "(*":
                in_comment = True
                continue
            if s.startswith("(*"):
                if not s.endswith("*)"):
                    self.errors.append(
                        f"line {i}: single-line comment is not closed"
                    )
                continue
            m = ROW_RE.match(s)
            if not m:
                self.errors.append(f"line {i}: row does not match grammar: {s!r}")
                continue
            addr, label, op, branch = m.groups()
            if addr in self.addresses:
                self.errors.append(f"line {i}: duplicate address {addr}")
            self.addresses.add(addr)
            self.rows.append(Row(addr, label, op, branch, i))
        if in_comment:
            self.errors.append("a block comment is not closed")

    def check(self):
        self._check_endings()
        self._check_ops()
        self._check_sizes()
        self._check_graph()
        self._check_style()

    def _check_endings(self):
        data = self.path.read_bytes()
        crlf = data.count(b"\r\n")
        bare_cr = data.count(b"\r") - crlf
        lf = data.count(b"\n")
        if bare_cr:
            self.errors.append("file contains bare CR characters")
        if crlf and crlf != lf:
            self.errors.append("file mixes CRLF and LF line endings")
        elif crlf:
            self.warns.append("file uses CRLF; repository form is LF")
        if data and not data.endswith(b"\n"):
            self.errors.append("file must end with LF")

    def _check_ops(self):
        d_map, c_map = load_lookups()
        for r in self.rows:
            op = r.op
            if r.branch != "stop" and not BRANCH_RE.fullmatch(r.branch):
                self.errors.append(f"{r.addr}: bad branch: {r.branch!r}")
            if r.branch == "stop" and op != "halt":
                self.errors.append(f"{r.addr}: only halt rows may stop")
            if op in ("gate", "halt"):
                if op == "gate" and len(GOTO_RE.findall(r.branch)) < 2:
                    self.errors.append(
                        f"{r.addr}: gate row needs at least two branch targets"
                    )
                if op == "halt" and r.branch != "stop":
                    self.errors.append(f"{r.addr}: halt row must end in stop")
                continue
            toks = op.split()
            if not toks:
                self.errors.append(f"{r.addr}: empty operation")
                continue
            if toks[0] in ("TX", "RX"):
                if len(toks) != 3:
                    self.errors.append(f"{r.addr}: bad communication op: {op!r}")
                    continue
                direction, cell, key = toks
                if c_map.get(key) != (direction, cell):
                    self.errors.append(f"{r.addr}: c-id mismatch: {op}")
            else:
                if len(toks) != 2:
                    self.errors.append(f"{r.addr}: bad derivation op: {op!r}")
                    continue
                edge, key = toks
                if d_map.get(key) != edge:
                    self.errors.append(f"{r.addr}: d-id mismatch: {op}")

    def _check_sizes(self):
        sizes = {}
        for r in self.rows:
            sizes[r.addr[0]] = sizes.get(r.addr[0], 0) + 1
        for region, n in sorted(sizes.items()):
            if n < MIN_ROWS:
                self.errors.append(
                    f"region {region}: {n} rows, minimum is {MIN_ROWS}"
                )
            elif n > 9:
                self.errors.append(
                    f"region {region}: {n} rows, hard maximum is 9"
                )
            elif n > MAX_ROWS:
                self.warns.append(
                    f"region {region}: {n} rows, comfort window is "
                    f"{MIN_ROWS}..{MAX_ROWS}"
                )

    def _check_graph(self):
        by_addr = {r.addr: r for r in self.rows}
        if not by_addr:
            self.errors.append("no rows parsed")
            return
        if "000" not in by_addr:
            self.errors.append("entry row 000 is missing")
        edges = {}
        terminal = set()
        for r in self.rows:
            pairs = GOTO_RE.findall(r.branch)
            targets = []
            for word, addr in pairs:
                if addr in targets:
                    continue
                targets.append(addr)
                if addr not in by_addr:
                    self.errors.append(f"{r.addr}: dangling goto {addr}")
            if r.branch == "stop":
                terminal.add(r.addr)
            edges[r.addr] = targets
        real = set(by_addr)
        seen = set()
        stack = ["000"] if "000" in by_addr else []
        while stack:
            a = stack.pop()
            if a in seen or a not in real:
                continue
            seen.add(a)
            stack.extend(t for t in edges.get(a, []) if t in real)
        for r in self.rows:
            if r.addr not in seen:
                self.errors.append(f"{r.addr}: unreachable row")
        for comp in scc(edges, seen):
            if not terminal.intersection(comp) and not any(
                t not in comp for a in comp for t in edges.get(a, [])
            ):
                self.errors.append(f"exitless loop: {sorted(comp)}")

    def _check_style(self):
        """Check only playbook rows and the playbook comment forms."""
        in_block = False
        in_banner = False
        titles = 0
        where = "style line {}"
        for r in self.rows:
            if r.label != r.label.upper():
                self.warns.append(
                    f"style line {r.line_no}: row label should be upper "
                    f"case, found {r.label!r}"
                )
        for i, raw in enumerate(self.lines, 1):
            line = raw.rstrip()
            s = line.strip()
            if in_block:
                if s == "*)":
                    in_block = False
                elif s and not raw.startswith("  "):
                    self.warns.append(
                        where.format(i)
                        + ": block comment body needs a two space indent"
                    )
                continue
            if s == "(*":
                in_block = True
                continue
            if BANNER_SHAPE_RE.fullmatch(s):
                if s != BANNER_RULE:
                    self.warns.append(
                        where.format(i)
                        + f": banner rule should hold 74 '=' and end "
                        f"at column {BANNER_WIDTH}"
                    )
                if in_banner and titles != 1:
                    self.warns.append(
                        where.format(i)
                        + f": banner should hold one title line, "
                        f"found {titles}"
                    )
                in_banner = not in_banner
                titles = 0
                continue
            if not (s.startswith("(*") and s.endswith("*)")):
                continue
            body = s[2:-2]
            if in_banner:
                titles += 1
                if len(line) != BANNER_WIDTH:
                    self.warns.append(
                        where.format(i)
                        + f": banner title should end at column "
                        f"{BANNER_WIDTH}"
                    )
                continue
            if body and (not body.startswith(" ") or not body.endswith(" ")):
                self.warns.append(
                    where.format(i)
                    + ": single line comment needs one space inside markers"
                )
            if body.startswith("  ") or body.endswith("  "):
                self.warns.append(
                    where.format(i)
                    + ": single line comment has decorative padding"
                )
        if in_banner:
            self.warns.append("style: banner is missing its closing rule")
        elif titles:
            self.warns.append("style: banner title is missing its opening rule")

    def report(self):
        for e in self.errors:
            print(f"error: {e}")
        for w in self.warns:
            print(f"warn:  {w}")
        print(
            f"rows {len(self.rows)}: errors {len(self.errors)}, "
            f"warns {len(self.warns)}"
        )
        return 0 if not self.errors else 1


def load_lookups():
    text = (REFERENCES / "derivation-set.md").read_text()
    d_map = {
        f"d{n}": f"{a}->{b}"
        for a, b, n in re.findall(r"^(\w+) -> (\w+)  (\d{2}) ", text, re.M)
    }
    text = (REFERENCES / "communication-set.md").read_text()
    c_map = {
        f"c{n}": (d, f"{s}:{o}")
        for n, d, s, o, _ in re.findall(
            r"^(\d{2}) (TX|RX) (\w+):(\w+)\s+(\S+)", text, re.M
        )
    }
    for key in (f"d{n:02d}" for n in range(1, 31)):
        if key not in d_map:
            raise SystemExit(f"references: derivation key {key} missing")
    for key in (f"c{n:02d}" for n in range(1, 31)):
        if key not in c_map:
            raise SystemExit(f"references: communication key {key} missing")
    return d_map, c_map


def scc(edges, nodes):
    index = {}
    low = {}
    on_stack = set()
    stack = []
    comps = []
    counter = [0]

    def visit(v):
        index[v] = low[v] = counter[0]
        counter[0] += 1
        stack.append(v)
        on_stack.add(v)
        for w in edges.get(v, []):
            if w not in nodes:
                continue
            if w not in index:
                visit(w)
                low[v] = min(low[v], low[w])
            elif w in on_stack:
                low[v] = min(low[v], index[w])
        if low[v] == index[v]:
            comp = []
            while True:
                w = stack.pop()
                on_stack.discard(w)
                comp.append(w)
                if w == v:
                    break
            comps.append(comp)

    for node in sorted(nodes):
        if node not in index:
            visit(node)
    return comps


def _format_comment_lines(lines):
    out = []
    in_block = False
    in_banner = False
    for raw in lines:
        line = raw.rstrip()
        s = line.strip()
        if in_block:
            if s == "*)":
                out.append("*)")
                in_block = False
            elif not s:
                out.append("")
            else:
                out.append("  " + s)
            continue
        if s == "(*":
            out.append("(*")
            in_block = True
            continue
        if BANNER_SHAPE_RE.fullmatch(s):
            out.append(BANNER_RULE)
            in_banner = not in_banner
            continue
        if in_banner and s.startswith("(*") and s.endswith("*)"):
            body = s[2:-2].strip()
            out.append(f"(* {body.ljust(BANNER_WIDTH - 6)} *)")
            continue
        if s.startswith("(*") and s.endswith("*)"):
            body = s[2:-2].strip()
            out.append(f"(* {body} *)" if body else "(*)")
            continue
        if s.startswith("<!--") or s.startswith(";"):
            out.append(line)
            continue
        out.append(line)
    return out


def format_lines(manual):
    comment_lines = _format_comment_lines(manual.lines)
    if not manual.rows:
        return comment_lines
    out = []
    rows = {r.line_no: r for r in manual.rows}
    w1 = max(len(r.addr + " " + r.label) for r in manual.rows)
    w2 = max(len(r.op) for r in manual.rows)
    for i, line in enumerate(comment_lines, 1):
        r = rows.get(i)
        if r is None:
            out.append(line)
            continue
        branch = " | ".join(p.strip() for p in r.branch.split("|"))
        head = (r.addr + " " + r.label).ljust(w1)
        out.append(f"{head} | {r.op.ljust(w2)} | {branch}")
    return out


def load_manual(path):
    path = Path(path)
    if not path.name.endswith(SUFFIX):
        print(
            f"error: {path}: a manual file must end with {SUFFIX}",
            file=sys.stderr,
        )
        raise SystemExit(2)
    return Manual(path)


if __name__ == "__main__":
    m = load_manual(sys.argv[1])
    m.check()
    sys.exit(m.report())
