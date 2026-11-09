# @path[pi/skills/fetch-deepseek-share/scripts/deepseek_cli/cli.py]
# the argument surface and the single exit policy.

import argparse
import os
import sys

from . import commands
from .messages import ShareError, UsageError, message


def build_parser():
    parser = argparse.ArgumentParser(
        prog="deepseek.py", description=message("cli.description")
    )
    subparsers = parser.add_subparsers(dest="command", required=True)

    fetch = subparsers.add_parser("fetch", help=message("cli.fetch"))
    fetch.add_argument("target", help=message("cli.target"))
    fetch.add_argument("--refresh", action="store_true", help=message("cli.refresh"))
    fetch.set_defaults(handler=commands.cmd_fetch)

    show = subparsers.add_parser("show", help=message("cli.show"))
    show.add_argument("target", help=message("cli.target"))
    show.add_argument("number", nargs="?", type=int, help=message("cli.number"))
    show.add_argument("--offset", type=int, default=0, help=message("cli.offset"))
    show.add_argument("--limit", type=int, help=message("cli.limit"))
    show.add_argument("--rebuild", action="store_true", help=message("cli.rebuild"))
    show.set_defaults(handler=commands.cmd_show)

    return parser


def main(argv=None):
    parser = build_parser()
    args = parser.parse_args(argv)

    if args.command == "show" and args.number is not None:
        if args.offset or args.limit is not None:
            parser.error("--offset and --limit only apply to the section list")

    try:
        args.handler(args)
    except UsageError as error:
        print(f"error: {error}", file=sys.stderr)
        return 2
    except ShareError as error:
        print(f"error: {error}", file=sys.stderr)
        return 1
    except BrokenPipeError:
        # the reading side closed the pipe, so stop quietly and skip the flush
        devnull = os.open(os.devnull, os.O_WRONLY)
        os.dup2(devnull, sys.stdout.fileno())
        os.close(devnull)
        return 0
    return 0
