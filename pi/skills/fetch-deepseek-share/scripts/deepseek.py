# @path[pi/skills/fetch-deepseek-share/scripts/deepseek.py]
# fetch and read a DeepSeek shared conversation.
#
# usage:
#   python3 deepseek.py fetch <id|url> [--refresh]
#   python3 deepseek.py show <id|url> [<message>] [--offset N] [--limit N] [--rebuild]
#
# exit codes:
#   0 success, including an empty page or a cache hit
#   1 fetch or cache failure
#   2 usage error

import sys

from deepseek_cli.cli import main

if __name__ == "__main__":
    sys.exit(main())
