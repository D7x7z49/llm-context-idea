#!/usr/bin/env bash
# scripts/install-prompt.sh
# =========================
# copy llm-context-idea prompt and experience conventions into your project.
#
# USAGE
# -----
#   curl -sSL https://raw.githubusercontent.com/D7x7z49/llm-context-idea/main/scripts/install-prompt.sh | bash
#   curl -sSL ... | bash -s /path/to/my-project

set -euo pipefail

# CONFIGURATION
# -------------

TARGET="${1:-$(pwd)}"
REPO="https://github.com/D7x7z49/llm-context-idea.git"
TMPDIR="$(mktemp -d)"

# CLEANUP
# -------

cleanup() { rm -rf "$TMPDIR"; }
trap cleanup EXIT

echo "installing llm-context-idea to $TARGET"

# CLONE
# -----

git clone --depth 1 --filter=blob:none --sparse "$REPO" "$TMPDIR" >/dev/null 2>&1
cd "$TMPDIR"
git sparse-checkout set prompt experience >/dev/null 2>&1

# PROMPT
# -------
# Domain-organized rule and convention files (*.md, *.ebnf).

mkdir -p "$TARGET/prompt"
cp -r prompt/* "$TARGET/prompt"
echo "---"
echo "[prompt]"
find "$TARGET/prompt" -type f | sed "s|^$TARGET/prompt/|  prompt/|" | sort

# EXPERIENCE
# ----------
# Domain-organized workflow experience files (*.exp.md).

mkdir -p "$TARGET/experience"
cp -r experience/* "$TARGET/experience"
echo "---"
echo "[experience]"
find "$TARGET/experience" -type f | sed "s|^$TARGET/experience/|  experience/|" | sort

# SUMMARY
# -------

pcount=$(find "$TARGET/prompt" -type f | wc -l)
ecount=$(find "$TARGET/experience" -type f | wc -l)
echo "---"
echo "done. installed $pcount prompt files, $ecount experience files."
