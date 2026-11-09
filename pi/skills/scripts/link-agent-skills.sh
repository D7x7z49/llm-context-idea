#!/usr/bin/env bash
# pi/skills/scripts/link-agent-skills.sh
# ======================================
# link every pi skill into ~/.agents/skills as a symlink.
#
# USAGE
# -----
#   bash pi/skills/scripts/link-agent-skills.sh
#
# A skill is a directory with SKILL.md directly under pi/skills.
# Re-run the script after adding or removing a skill.

set -euo pipefail

# CONFIGURATION
# -------------

SRC="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DEST="$HOME/.agents/skills"

echo "linking skills from $SRC to $DEST"
mkdir -p "$DEST"

# LINK
# ----

linked=0
for skill in "$SRC"/*; do
    [ -d "$skill" ] && [ -f "$skill/SKILL.md" ] || continue
    name="$(basename "$skill")"
    link="$DEST/$name"
    if [ -e "$link" ] && [ ! -L "$link" ]; then
        echo "skip $name: $link is not a symlink" >&2
        continue
    fi
    ln -sfn "$skill" "$link"
    echo "  linked $name"
    linked=$((linked + 1))
done

# PRUNE
# -----
# remove links into pi/skills whose skill was deleted or renamed.

for link in "$DEST"/*; do
    [ -L "$link" ] || continue
    case "$(readlink "$link")" in
        "$SRC"/*)
            if [ ! -e "$link" ]; then
                rm "$link"
                echo "  pruned $(basename "$link")"
            fi
            ;;
    esac
done

# SUMMARY
# -------

echo "---"
echo "done. linked $linked skills."
