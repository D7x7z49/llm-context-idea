#!/usr/bin/env python3
# scripts/lint_playbook.py
# check one playbook manual: syntax, bindings, region sizes, graph.

import sys

from lib_playbook import load_manual

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("usage: lint_playbook.py <manual.playbook>")
        sys.exit(2)
    manual = load_manual(sys.argv[1])
    manual.check()
    sys.exit(manual.report())
