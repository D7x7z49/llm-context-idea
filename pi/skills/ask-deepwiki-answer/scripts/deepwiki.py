# @path[pi/skills/ask-deepwiki-answer/scripts/deepwiki.py]
# answer a question about a public repository through the DeepWiki MCP server.
#
# usage:
#   python3 deepwiki.py ask <owner/repo> "<question>" [--related <owner/repo>]...
#   python3 deepwiki.py structure <owner/repo>
#   python3 deepwiki.py contents <owner/repo>
#   python3 deepwiki.py page <owner/repo> [<n>|<title>] [--max-lines <n>]
#   python3 deepwiki.py answers [<owner/repo>]
#
# exit codes:
#   0 success
#   1 request, cache, or tool failure
#   2 usage error

import sys

from deepwiki_cli.cli import main

if __name__ == "__main__":
    sys.exit(main())
