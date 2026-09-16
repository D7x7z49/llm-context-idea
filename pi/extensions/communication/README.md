# pi-good-communication

good communication discipline for the pi coding agent.

conversation stays oral and immediate.
complex ideas persist as written artefacts.

## concept

a pi session is a Shannon communication channel.

the Information Source [SRC] is the user, which encodes intent as natural language.
the Destination [DST] is the agent, which decodes language, acts, and encodes a response.

each signal should be short, single-purpose, and free of structural noise.
this extension enforces that at both ends.

inspired by the WAL GUIDANCE block:

```ebnf
(*
  GUIDANCE.
  One line. One step.
  One step. One job only.
  For LLM steps. Keep text short.
  If more detail is needed, write a document.
  For shell steps. Do not use pipe, && or ||.
  Write a script file instead.
*)
```

## oral and written

conversation is oral, so it stays immediate, transient, and lived.
documents and scripts are written, so they stay durable, revisable, and shared.

route complexity away from the channel toward four targets.

- keep project documents in `docs/` for design notes, rationale, and decisions.
- keep project scripts in `scripts/` for reusable and auditable tools.
- keep transient documents in `tmp/docs/` for dependency notes and scratch reasoning.
- keep transient scripts in `tmp/scripts/` for one-off helpers and experimental tooling.

the first two are project assets under version control.
the last two reference external concerns or material not yet ready to commit.

## unit

one unit is one code point.
a run of a word-spacing script costs one unit for the whole run.

- count `hello` as 1 unit.
- count `hello world` as 3 units.
- count `你好` as 2 units.
- count `2024-09-15` as 10 units.

the exemption table in `src/ranges.ts` lists 22 word-spacing scripts:

- latin, cyrillic, greek, armenian, georgian, hebrew, arabic, and syriac.
- thaana, devanagari, bengali, gurmukhi, gujarati, oriya, tamil, and telugu.
- kannada, malayalam, sinhala, ethiopic, cherokee, and hangul.

han, kana, thai, lao, tibetan, myanmar, and khmer have no word spacing,
so their code points count one by one.
whitespace, punctuation, and digits count one by one as well.

## src-msg

the src-msg guard limits a user prompt to 160 units.

- pass silently below 160 units.
- block at or above 160 units.

```typescript
decideUnits(measureUnits(event.text), THRESHOLDS.prose);
```

## src-cmd

the src-cmd guard limits a user shell command to 80 units.
it intercepts `!` and `!!` through the `user_bash` event.

- pass below 80 units.
- block at or above 80 units.

```typescript
decideUnits(measureUnits(event.command), THRESHOLDS.shell);
```

## dst-bash

the dst-bash guard limits an agent shell command to 80 units.

- pass silently below 80 units.
- block at or above 80 units.

on failure, the guard suggests extracting the command into a standalone script.
that keeps debugging and re-runs cheap.

```typescript
decideUnits(measureUnits(command), THRESHOLDS.shell);
```

## together

the three guards keep the channel short.

- keep prompts below 160 units with the src-msg guard.
- keep user shell commands below 80 units with the src-cmd guard.
- keep agent shell commands below 80 units with the dst-bash guard.

each guard has two zones.
it acts mechanically, with no prompts and no confirmations.
a passing signal gets measured once, then continues unchanged.

this is a communication discipline, not a security boundary.
