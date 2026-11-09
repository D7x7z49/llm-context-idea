# @path[pi/skills/ask-deepwiki-answer/scripts/deepwiki_cli/cli.py]
# the argument surface and the single exit policy.

import argparse
import os
import sys

from . import commands
from .messages import CliError, ServerError, message


def add_proxy_flag(parser):
    parser.add_argument("--proxy", action="store_true", help=message("cli.proxy"))


def add_refresh_flag(parser):
    parser.add_argument("--refresh", action="store_true", help=message("cli.refresh"))


def build_parser():
    parser = argparse.ArgumentParser(
        prog="deepwiki.py", description=message("cli.description")
    )
    subparsers = parser.add_subparsers(dest="command", required=True)

    ask = subparsers.add_parser("ask", help=message("cli.ask"))
    ask.add_argument("repo", help=message("cli.ask.repo"))
    ask.add_argument("question", help=message("cli.ask.question"))
    ask.add_argument(
        "--related", action="append", default=[], help=message("cli.ask.related")
    )
    add_refresh_flag(ask)
    add_proxy_flag(ask)
    ask.set_defaults(handler=commands.cmd_ask)

    structure = subparsers.add_parser("structure", help=message("cli.structure"))
    structure.add_argument("repo", help=message("cli.ask.repo"))
    add_refresh_flag(structure)
    add_proxy_flag(structure)
    structure.set_defaults(handler=commands.cmd_structure)

    contents = subparsers.add_parser("contents", help=message("cli.contents"))
    contents.add_argument("repo", help=message("cli.ask.repo"))
    add_refresh_flag(contents)
    add_proxy_flag(contents)
    contents.set_defaults(handler=commands.cmd_contents)

    page = subparsers.add_parser("page", help=message("cli.page"))
    page.add_argument("repo", help=message("cli.page.repo"))
    page.add_argument("selector", nargs="?", help=message("cli.page.selector"))
    page.add_argument("--max-lines", type=int, default=0, help=message("cli.page.max"))
    page.set_defaults(handler=commands.cmd_page)

    answers = subparsers.add_parser("answers", help=message("cli.answers"))
    answers.add_argument("repo", nargs="?", help=message("cli.answers.repo"))
    answers.set_defaults(handler=commands.cmd_answers)

    return parser


def main(argv=None):
    args = build_parser().parse_args(argv)
    try:
        args.handler(args)
    except (CliError, ServerError) as error:
        print(f"error: {error}", file=sys.stderr)
        return 1
    except BrokenPipeError:
        # the reading side closed the pipe, so stop quietly and skip the flush
        devnull = os.open(os.devnull, os.O_WRONLY)
        os.dup2(devnull, sys.stdout.fileno())
        os.close(devnull)
        return 0
    return 0
