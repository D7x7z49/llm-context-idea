# pi-wal

WAL (Workflow As List) extension for the pi coding agent.

records agent interactions as replayable .wal scripts.
turns pi sessions into written workflow assets.

## concept

WAL is a line-oriented workflow language.
every step starts with `- `:

```text
- text         plain LLM interaction
- ! command    shell execution
```

this extension supports the minimal WAL subset:
no imports, no variables, no jumps.

## wal format (subset)

```wal
- Ask the user what they want to build
- Read the README and summarize the project
- ! ls -la
- ! cat package.json
- Write a plan based on what you found
```

- `- text` sends text to the LLM.
- `- ! command` executes a shell command.

## commands

### /wal save [path]

save current session as a `.wal` file.

if path is omitted, auto-generates filename:
`tmp/wal/<session>-<timestamp>.wal`

```text
iterate session branch entries
extract user text prompts    → "- <text>"
extract bash tool calls      → "- ! <command>"
prepend WAL_HEADER comment block
write to file
```

### /wal preview

show session in WAL format without writing to disk.
shows first 20 steps in a notification.

## mapping: pi session → WAL

```text
pi action              WAL step
───────────────────────────────
user text prompt       "- <text>"
user !command          "- ! <command>"
everything else        skipped
```

only the initiating side is captured:
user text (LLM prompts) and user !command (shell execution).
LLM tool calls, assistant text, file operations are
responses — not requests — and are skipped.

## implementation notes

- `WAL_HEADER` constant: describes simplified `@SYNTAX.ebnf` subset.
- user text from `ctx.sessionManager.getBranch()` user messages.
- user `!command` from `pi.on("user_bash")` event tracking.
- merged chronologically by timestamp before output.

## dependencies

none beyond pi core. `node:fs` and `node:path` are built-in.

## status

```text
design                    done
skeleton                  done
/wal save + preview       done
wal_run                   todo (future)
test                      todo
```
