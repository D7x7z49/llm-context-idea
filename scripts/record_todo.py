# scripts/record_todo.py
#   add <path>     validate a block file and append it to todo.md
#   list           list all blocks with PREMISE and GOAL
#   info <n>       show full details of block number n

import argparse
import sys
from dataclasses import dataclass, field
from pathlib import Path
from typing import TextIO

# --- constants ---------------------------------------------------------

TODO_FILENAME = "todo.md"
EBNF_REFERENCE = "prompt/dev/todo.ebnf"
BLOCK_SEPARATOR = "---"
HEADER_PREFIX = "<!--"
ACTIONS_PREFIX = "- [ ]"

SECTION_PREMISE = "PREMISE:"
SECTION_GOAL = "GOAL:"
SECTION_ACTIONS = "ACTIONS:"

# header template for todo.md; {path} is the file's relative path from project root
_TODO_HEADER = """\
<!-- {path}
structured todo blocks

  PREMISE.
  - condition that must hold before the task can start (precondition)
  - declarative sentence

  GOAL.
  - target state to reach
  - declarative sentence

  ACTIONS.
  - concrete steps to reach the goal
  - imperative sentences (5W1H)

  blocks are separated by a line containing only "---".
  this comment block serves as a permanent key-reference for the reader.
-->
"""


@dataclass
class Block:
    premise: str
    goal: str
    actions: list[str] = field(default_factory=list)


# --- project root ------------------------------------------------------

def find_project_root() -> Path:
    p = Path.cwd()
    for parent in (p, *p.parents):
        if (parent / ".git").is_dir():
            return parent
    sys.exit("[!] no .git directory found in any parent")


# --- validation --------------------------------------------------------

def validate_block(text: str) -> list[str]:
    errors: list[str] = []
    lines = text.strip().splitlines()
    state = "premise"
    actions: list[str] = []

    for line in lines:
        stripped = line.strip()
        if stripped == BLOCK_SEPARATOR:
            errors.append("block must not contain '---' (reserved separator)")
            continue
        match state:
            case "premise":
                if stripped.startswith(SECTION_PREMISE):
                    val = stripped.removeprefix(SECTION_PREMISE).strip()
                    if not val:
                        errors.append("PREMISE must have content")
                    state = "goal"
                else:
                    errors.append(f"expected PREMISE:, got: {stripped[:50]}")
                    return errors
            case "goal":
                if stripped.startswith(SECTION_GOAL):
                    val = stripped.removeprefix(SECTION_GOAL).strip()
                    if not val:
                        errors.append("GOAL must have content")
                    state = "actions_header"
                else:
                    errors.append(f"expected GOAL:, got: {stripped[:50]}")
                    return errors
            case "actions_header":
                if stripped == SECTION_ACTIONS:
                    state = "actions"
                else:
                    errors.append(f"expected ACTIONS:, got: {stripped[:50]}")
                    return errors
            case "actions":
                if stripped.startswith(ACTIONS_PREFIX):
                    content = stripped.removeprefix(ACTIONS_PREFIX).strip()
                    if not content:
                        errors.append("action item must have content")
                    actions.append(stripped)
                elif stripped:
                    errors.append(f"action must start with '- [ ]', got: {stripped[:50]}")

    if state == "premise":
        errors.append("missing PREMISE section")
    elif state == "goal":
        errors.append("missing GOAL section")
    elif state == "actions_header":
        errors.append("missing ACTIONS section")
    elif state == "actions" and not actions:
        errors.append("ACTIONS must have at least one item")

    return errors


def show_ebnf(file: TextIO = sys.stdout) -> None:
    ebnf_path = Path(EBNF_REFERENCE)
    if ebnf_path.exists():
        print(ebnf_path.read_text(), file=file)
    else:
        print(f"[!] EBNF reference not found: {EBNF_REFERENCE}", file=file)


# --- parsing -----------------------------------------------------------

def parse_blocks(content: str) -> list[Block]:
    # strip header comment
    i = content.index("-->") + 3
    body = content[i:]
    blocks: list[Block] = []
    for chunk in body.split("\n" + BLOCK_SEPARATOR + "\n"):
        chunk = chunk.strip()
        if not chunk:
            continue
        premise = ""
        goal = ""
        actions: list[str] = []
        state = "premise"
        for line in chunk.splitlines():
            stripped = line.strip()
            match state:
                case "premise":
                    if stripped.startswith(SECTION_PREMISE):
                        premise = stripped.removeprefix(SECTION_PREMISE).strip()
                        state = "goal"
                case "goal":
                    if stripped.startswith(SECTION_GOAL):
                        goal = stripped.removeprefix(SECTION_GOAL).strip()
                        state = "actions"
                case "actions":
                    if stripped.startswith(ACTIONS_PREFIX):
                        actions.append(stripped.removeprefix(ACTIONS_PREFIX).strip())
        blocks.append(Block(premise, goal, actions))
    return blocks


# --- file i/o ----------------------------------------------------------

def read_todo(path: Path) -> str:
    if path.exists():
        return path.read_text()
    root = find_project_root()
    rel = path.resolve().relative_to(root)
    header = _TODO_HEADER.format(path=str(rel))
    path.write_text(header)
    return header


def write_todo(path: Path, content: str) -> None:
    tmp = path.with_suffix(".tmp")
    tmp.write_text(content)
    tmp.replace(path)


def append_block_text(todo_path: Path, block_text: str) -> None:
    current = read_todo(todo_path)
    i = current.index("-->") + 3
    header = current[:i]
    after = current[i:]
    body = after.rstrip("\n")
    if body:
        body += "\n"
    body += "\n\n" + BLOCK_SEPARATOR + "\n\n" + block_text.strip()
    write_todo(todo_path, header + body + "\n")


# --- commands ----------------------------------------------------------

def cmd_add(block_path: Path, todo_path: Path) -> None:
    if not block_path.exists():
        sys.exit(f"[!] block file not found: {block_path}")
    text = block_path.read_text()
    errors = validate_block(text)
    if errors:
        for e in errors:
            print(f"[!] {e}")
        print()
        show_ebnf()
        sys.exit(1)
    append_block_text(todo_path, text)
    print(f"[+] appended block")


def cmd_list(todo_path: Path) -> None:
    content = read_todo(todo_path)
    blocks = parse_blocks(content)
    if not blocks:
        print("[?] no blocks")
        return
    for i, b in enumerate(blocks, 1):
        print(f"{i}. {b.premise} :: {b.goal}")


def cmd_info(number: int, todo_path: Path) -> None:
    content = read_todo(todo_path)
    blocks = parse_blocks(content)
    if number < 1 or number > len(blocks):
        sys.exit(f"[!] block {number} not found (1..{len(blocks)})")
    b = blocks[number - 1]
    print(f"PREMISE: {b.premise}")
    print(f"GOAL: {b.goal}")
    print("ACTIONS:")
    for a in b.actions:
        print(f"  - [ ] {a}")


# --- cli ---------------------------------------------------------------

def parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        prog="record_todo",
        description="Record structured todo blocks into todo.md",
    )
    sub = parser.add_subparsers(dest="command", required=True)

    p_add = sub.add_parser("add", help="validate a block file and append it")
    p_add.add_argument("path", help="path to a block.tmp file")

    sub.add_parser("list", help="list all blocks with PREMISE and GOAL")

    p_info = sub.add_parser("info", help="show full details of a block")
    p_info.add_argument("number", type=int, help="block number (1-indexed)")

    return parser.parse_args(argv)


def main(argv: list[str] | None = None) -> None:
    args = parse_args(argv)
    root = find_project_root()
    todo_path = root / TODO_FILENAME

    match args.command:
        case "add":
            block_path = Path(args.path).resolve()
            cmd_add(block_path, todo_path)
        case "list":
            cmd_list(todo_path)
        case "info":
            cmd_info(args.number, todo_path)


if __name__ == "__main__":
    main()
