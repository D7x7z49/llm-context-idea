#!/usr/bin/env python3
# scripts/fmt_playbook.py
# normalize one playbook manual: format supported comments, align the
# three columns, and keep row order untouched. the result must pass lint.

import sys
from pathlib import Path

from lib_playbook import format_lines, load_manual

if __name__ == "__main__":
    if len(sys.argv) not in (2, 3) or (
        len(sys.argv) == 3 and sys.argv[1] != "-i"
    ):
        print("usage: fmt_playbook.py [-i] <manual.playbook>")
        sys.exit(2)
    inplace = sys.argv[1] == "-i"
    path = Path(sys.argv[2] if inplace else sys.argv[1])
    manual = load_manual(path)
    text = "\n".join(format_lines(manual)) + "\n"
    if inplace:
        path.write_text(text, newline="\n")
    else:
        sys.stdout.write(text)
