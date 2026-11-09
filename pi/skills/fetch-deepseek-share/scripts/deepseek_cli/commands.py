# @path[pi/skills/fetch-deepseek-share/scripts/deepseek_cli/commands.py]
# one function per subcommand; this is the only layer that prints a result.

import sys

from . import api, share
from .messages import ShareError, UsageError, message


def cmd_fetch(args):
    share_id = api.parse_share_id(args.target)
    target = share.json_path(share_id)

    if target.exists() and not args.refresh:
        if share.payload_or_none(target) is not None:
            print(target.resolve())
            print(
                message("note.cached", path=target.resolve()),
                file=sys.stderr,
            )
            return
        print(message("note.repair", path=target.resolve()), file=sys.stderr)

    raw = api.fetch_raw(share_id)
    payload = api.parse_payload(raw)
    if not api.share_messages(payload):
        print(message("note.empty.share"), file=sys.stderr)
        return

    share.write_atomic(target, raw.decode("utf-8"))
    print(target.resolve())


def cmd_show(args):
    if args.offset < 0:
        raise UsageError(message("error.offset.negative", value=args.offset))
    if args.limit is not None and args.limit < 0:
        raise UsageError(message("error.limit.negative", value=args.limit))

    share_id = api.parse_share_id(args.target)
    json_file = share.json_path(share_id)
    if not json_file.exists():
        raise ShareError(
            message("error.cache.missing", path=json_file, target=args.target)
        )

    payload = share.load_payload(json_file)
    messages = api.share_messages(payload)

    if args.number is not None:
        show_message(messages, args.number)
        return

    share.ensure_view(json_file, share.view_path(share_id), messages, args.rebuild)
    show_sections(share_id, args.offset, args.limit)


def show_message(messages, number):
    if not 1 <= number <= len(messages):
        raise UsageError(
            message("error.number.range", number=number, count=len(messages))
        )
    text = share.message_text(messages, number)
    if not text:
        print(message("note.empty.message", number=number), file=sys.stderr)
        return
    print(text)


def show_sections(share_id, offset, limit):
    view_text = share.view_path(share_id).read_text(encoding="utf-8")
    sections = share.split_sections(view_text)
    if offset >= len(sections):
        print(
            message("note.offset", offset=offset, count=len(sections)),
            file=sys.stderr,
        )
        return
    sections = sections[offset:]
    if limit is not None:
        sections = sections[:limit]
    if not sections:
        print(message("note.empty.sections"), file=sys.stderr)
        return
    print("\n\n".join(sections))
