# pi-user-scribe

user input export for the [pi](https://github.com/earendil-works/pi) coding agent.

turns the human side of a session into a plain text file.
it keeps what the human typed, and which shell commands the human ran.
the agent side is left out on purpose, because it buries the human input.

source: <https://github.com/D7x7z49/llm-context-idea/tree/main/pi/extensions/scribe#readme>

## concept

the session is the archive.
the export is a view of it: reproducible, and safe to drop and regenerate.
the tool reads `ctx.sessionManager`, so it also works on past sessions,
and it never depends on a live event being present at the right moment.

two record kinds only:

```text
@@ msg    a user message
@@ cmd    a shell command the user ran with ! or !!
```

## format

framing rule: a line that starts with `@@` carries structure,
every other line is content.
the head is closed by `@@ ---`:

```text
@@ scribe - raw user input export
@@ version 1
@@ session 01a0a377-20fc-767c-8bb4-d290a8494d39
@@ leaf 9f2c1a
@@ export 2026-09-16T05:24:38.667Z
@@ records 3
@@ counts msg=2 cmd=1
@@ ---
@@ msg [sha256:2cf24db]
hello
@@ cmd [sha256:a9e739d] [exclude]
git status
with a second line
@@ msg [sha256:d160e10] [image]
what about this image?
```

- `@@ session` and `@@ leaf` name the archive and the point the export stops at.
- `@@ records` and `@@ counts` are reader expectations, not copies of the data.
  a mismatch means the file was truncated.
- `sha256:` covers the body bytes in utf-8, never the newline that closes them.
  the token stays short: seven hex characters, extended only while two bodies collide.
  brackets keep the colon inside one token, so no bare key-value syntax spreads.
- `[exclude]` marks a `!!` command, whose raw text no longer carries the prefix.
- `[image]` marks a record that carried image content. no bytes are exported.
- every field after the kind token is a bracketed token, so one shape fits all.
- a zero byte body is legal.
  a body line that looks like framing is harmless: its hash will not verify.

## commands

### /scribe

write the export to `tmp/scribe/YYYYMMDDTHHMMSSZ.tmp` under the project root,
then notify the path. the time is UTC.

the file is created under an exclusive name and only then hard linked into place,
so a reader never sees a partial file,
and an existing export is never replaced silently.

### /scribe preview

render the same export through the same serializer and the same validation,
without writing a file.
the head shows first; press ctrl+o to show the whole text.

preview needs the interactive TUI, and fails loudly in any other mode.

## mapping: pi session to record

```text
pi entry                    record
------------------------------------
user message, text blocks   @@ msg          blocks joined with a newline
user message, image block   @@ msg image
! command                   @@ cmd          bashExecution
!! command                  @@ cmd exclude  bashExecution
assistant, tool results,
custom entries              skipped
```

- raw text is copied as is, so a `/...` directive stays a directive.
- command output, exit codes, and timestamps are not exported.
- an extension command such as `/scribe` itself never reaches the session,
  so it cannot appear in the export.

## dependencies

none beyond pi core.
`node:fs`, `node:path`, and `node:crypto` are built-in.

## status

```text
design                     done
/scribe + /scribe preview  done
unit + integration tests   done
import, replay, workflow   dropped
```

## related

- `@d7x7/pi-wal`: the earlier workflow extension, replaced by this export tool.
