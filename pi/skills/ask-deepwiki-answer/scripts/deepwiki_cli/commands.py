# @path[pi/skills/ask-deepwiki-answer/scripts/deepwiki_cli/commands.py]
# one function per subcommand; this is the only layer that prints a result.

import sys

from . import pages, server, store
from .messages import CliError, message

MAX_REPOS = 10


def cmd_ask(args):
    repos = [args.repo] + list(args.related)
    if len(repos) > MAX_REPOS:
        raise CliError(message("error.repo.limit", max=MAX_REPOS, count=len(repos)))
    digest = store.request_digest(args.repo, args.related, args.question)

    if not args.refresh:
        cached = store.read_request(args.repo, digest)
        if cached is not None:
            record, answer = cached
            print(answer.rstrip())
            print(
                message("note.cached", stamp=record.get("fetched_at", "?")),
                file=sys.stderr,
            )
            return

    opener = server.build_opener(args.proxy)
    tool, answer = server.call_ask(repos, args.question, opener)
    store.write_request(
        args.repo,
        digest,
        {
            "schema": store.SCHEMA_VERSION,
            "primary": store.repo_name(args.repo),
            "related": [store.repo_name(repo) for repo in args.related],
            "question": args.question,
            "tool": tool,
            "server": server.SERVER_URL,
            "fetched_at": store.timestamp(),
        },
        answer,
    )
    print(answer)


def cmd_structure(args):
    path = fetch_wiki(
        args.repo, "structure", server.TOOL_STRUCTURE, args.proxy, args.refresh
    )
    print(path.read_text(encoding="utf-8").rstrip())


def cmd_contents(args):
    path = fetch_wiki(
        args.repo, "contents", server.TOOL_CONTENTS, args.proxy, args.refresh
    )
    text = path.read_text(encoding="utf-8")
    print(
        message(
            "report.contents",
            path=path,
            pages=len(pages.page_ranges(text.splitlines())),
            lines=len(text.splitlines()),
        )
    )


def fetch_wiki(repo, kind, tool, proxy, refresh):
    path = store.wiki_dir(repo) / store.WIKI_FILE[kind]
    if path.exists() and not refresh:
        return path

    opener = server.build_opener(proxy)
    text = server.call_tool(tool, {"repoName": store.repo_name(repo)}, opener)
    store.write_atomic(path, text)
    store.update_meta(repo, kind, len(text.splitlines()), len(text))
    return path


def cmd_page(args):
    path = store.wiki_dir(args.repo) / store.WIKI_FILE["contents"]
    text = store.read_contents(args.repo)
    lines = text.splitlines()
    ranges = pages.page_ranges(lines)
    if not ranges:
        raise CliError(message("error.wiki.marker", path=path))

    if args.selector is None:
        print(message("report.pages", path=path))
        print(message("report.page_count", pages=len(ranges), lines=len(lines)))
        for number, (title, start, end) in enumerate(ranges, start=1):
            print(f"{number:>3} {start + 1:>6}-{end:<6} {title}")
        return

    _, start, end = ranges[pages.find_page(ranges, args.selector)]
    body = lines[start:end]
    limit = args.max_lines if args.max_lines > 0 else len(body)
    print("\n".join(body[:limit]))
    if limit < len(body):
        sys.stdout.flush()
        print(
            message(
                "note.truncated",
                count=len(body) - limit,
                path=path,
                first=start + limit + 1,
                last=end,
            ),
            file=sys.stderr,
        )


def cmd_answers(args):
    root = store.CACHE_ROOT / "answers"
    if args.repo:
        owner, name = store.repo_parts(args.repo)
        root = root / owner / name

    records = sorted(root.rglob(store.REQUEST_FILE)) if root.exists() else []
    count = 0
    for path in records:
        record = store.read_json_or_none(path)
        if not record:
            continue
        related = ",".join(record.get("related", [])) or "-"
        print(
            message(
                "report.answer",
                stamp=record.get("fetched_at", "?"),
                primary=record.get("primary", "?"),
                related=related,
                question=record.get("question", "?"),
            )
        )
        count += 1

    if not count:
        print(message("note.answers.none"))
