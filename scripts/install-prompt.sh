#!/usr/bin/env bash
# install-prompt.sh — copy llm-context-idea conventions into your project.
#
# usage:
#   curl -sSL https://raw.githubusercontent.com/D7x7z49/llm-context-idea/main/scripts/install-prompt.sh | bash
#   curl -sSL ... | bash -s /path/to/my-project

set -euo pipefail

TARGET="${1:-$(pwd)}"
REPO="https://github.com/D7x7z49/llm-context-idea.git"
TMPDIR="$(mktemp -d)"

cleanup() { rm -rf "$TMPDIR"; }
trap cleanup EXIT

echo "installing llm-context-idea prompts to $TARGET/.pi/prompts"

git clone --depth 1 --filter=blob:none --sparse "$REPO" "$TMPDIR" >/dev/null 2>&1
cd "$TMPDIR"
git sparse-checkout set prompt >/dev/null 2>&1

mkdir -p "$TARGET/.pi/prompts"
cp -r prompt/* "$TARGET/.pi/prompts"

echo ""
echo "installed:"
find "$TARGET/.pi/prompts" -type f | sed "s|^$TARGET/.pi/prompts/|  |" | sort
echo ""
echo "done."
