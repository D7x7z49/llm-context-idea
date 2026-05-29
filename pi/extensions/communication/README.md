# pi-good-communication

good communication discipline for the pi coding agent.

conversation stays oral and immediate.
complex ideas persist as written artefacts.

## concept

a pi session is a Shannon communication channel.

- Information Source (SRC) — the user. encodes intent as natural language.
- Destination (DST) — the agent. decodes language, acts, encodes response.

each signal should be short, single-purpose, and free of structural noise.
this extension enforces that at both ends.

inspired by the WAL GUIDANCE block:

```ebnf
(* One line. One step.
   One step. One job only.
   For LLM steps. Keep text short.
   If more detail is needed, write a document.
   For shell steps. Do not use pipe, && or ||.
   Write a script file instead. *)
```

## oral and written

conversation is oral — immediate, transient, lived.
documents and scripts are written — durable, revisable, shared.

complexity routes away from the channel toward four targets:

- `docs/` — project documents. design notes, rationale, decisions.
- `scripts/` — project scripts. reusable, versioned, auditable.
- `tmp/docs/` — transient documents. external dependency notes, scratch reasoning.
- `tmp/scripts/` — transient scripts. one-off helpers, experimental tooling.

the first two are project assets under version control.
the last two reference external concerns or material not yet ready to commit.

## src-msg

user prompt length guard. two zones based on character count.

- [0, 160) — pass silently.
- [160, +infinity) — block.

```typescript
declare function isBlocked(length: number): boolean;
declare const MAX_CHARS: 160;
```

## src-cmd

user shell command guard. intercepts `!` and `!!` via the `user_bash` event.

- [0, 160) — pass.
- [160, +infinity) — block.

```typescript
declare function blockResult(msg: string): BlockResult;
```

## dst-bash

agent shell execution guard. two zones based on character count.

- [0, 160) — pass silently.
- [160, +infinity) — block.

on bash failure, appends a light suggestion to extract the command
into a standalone script for debugging and re-runs.

```typescript
declare function isBlocked(length: number): boolean;
```

## together

```text
SRC-msg  →  keep prompts short
SRC-cmd  →  keep user shell short
DST-bash →  keep agent shell short
```

two zones, mechanically enforced. no prompts, no confirmations.
no runtime overhead for passes.

this is a communication discipline, not a security boundary.
when used with pi-wal, Guard enforces clean structure and WAL records clean steps.
