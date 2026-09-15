---
name: autonomy-protocol
description: >
  compose, format, and lint autonomy protocol playbooks: assembly style
  work protocols where one row is one minimal work unit carrying an
  address, a label, an operation, and a branch. use when writing,
  editing, or checking .playbook files that hold three-digit
  addresses, derivation keys like d16, communication keys like c21,
  gate pass fail rows, or halt stop rows. also use when looking up the
  meaning of the two 30-entry instruction sets.
---

# Autonomy Protocol

a playbook is a work protocol encoded as one row per minimal work unit.
an agent executes one row at a time and jumps where the branch says.
a playbook file carries the `.playbook` suffix.

row form:

```text
address label | operation | branch
```

- the address is three decimal digits. hundreds = region,
  tens = row order, ones = insertion slot.
- the operation encodes one instruction: `OBS -> QUE d02` for a derivation move,
  or `TX U:AU c08` for a communication move.
- `gate` is a judgment row with at least two branch targets,
  for example `pass 100 | fail 000`.
- `halt` is the stop row. its branch is `stop`.
- a communication `pending` result is local to the current information and direct channel.

use cases

- format a playbook with tools: run the formatter, then the linter,
  in that order.
- check a playbook with tools: the linter is the decider,
  the agent does not judge loops from its head.
- look up an instruction meaning: read the references.

format playbook structure

```bash
python3 <skill-dir>/scripts/fmt_playbook.py path/to/manual.playbook
python3 <skill-dir>/scripts/fmt_playbook.py -i path/to/manual.playbook
```

- this formatter normalizes supported comments, aligns the columns, and leaves row order untouched.

check playbook structure

```bash
python3 <skill-dir>/scripts/lint_playbook.py path/to/manual.playbook
```

- both tools accept only a file that ends with `.playbook`.
- the linter checks row grammar, operation key bindings,
  region sizes (3 to 7 rows; 8 to 9 is a warning), dangling gotos,
  unreachable rows, exitless loops, and comment style.
- malformed rows, comments, bindings, and graph edges are errors.
- mixed or missing line endings are errors; CRLF is accepted with a warning.
- style deviations and the 8-to-9 row comfort overflow are warnings.
- below 3 or above 9 is an error; exit code 1 means errors.

composing

- start from the minimal skeleton in assets/template.playbook.
- write the current row only, do not anticipate loops.
- keep one region at 3 to 7 rows.
- run lint before calling a playbook ready.

references

- references/grammar.abnf: full ABNF of the row grammar.
- references/derivation-set.md: the 30 derivation instructions.
- references/communication-set.md: the 30 communication instructions.
- references/composition-rules.md: address model, comment style,
  region rules, boundary rules, verification contract.
