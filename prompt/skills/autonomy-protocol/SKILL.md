---
name: autonomy-protocol
description: >
  compose, format, and lint autonomy protocol playbooks. use when writing,
  editing, checking, or interpreting `.playbook` files with three-digit
  addresses, derivation keys such as `d16`, communication keys such as `c21`,
  gate rows, or halt rows.
---
<!-- prompt/skills/autonomy-protocol/SKILL.md -->
<!-- NOTE: compose and verify assembly-style work protocols with one row per minimal work unit. -->

PURPOSE
- compose work protocols as addressable rows
- format playbooks without changing row order
- lint playbooks before treating them as ready
- look up derivation and communication instruction keys

SCOPE
- apply this skill to manuals that end with `.playbook`
- treat one row as one minimal work unit
- use the instruction references when a key needs interpretation
- use the scripts and assets relative to this skill directory

ROW FORM
- write each row as `address label | operation | branch`
- keep the address, label, operation, and branch on one row
- make each row self-contained
- write the current row only and do not anticipate the loop
- execute one row and move exactly where its branch says

ADDRESS MODEL
- use exactly three decimal digits for each address
- use the hundreds digit to name the autonomy region
- use the tens digit to order rows inside the region
- reserve the ones digit for a later insertion
- leave unused addresses for insertion instead of renumbering existing rows
- make `000` the entry row

LABEL MODEL
- use one alphabetic label for each row
- write row labels in uppercase
- keep the label to one word
- use labels such as `DIR`, `QUE`, `GATE`, and `HALT`

OPERATION MODEL
- use one derivation operation, communication operation, signal, or halt operation
- write a derivation operation as `OBS->QUE d02` with no spaces around the arrow
- write a communication operation as `RX K:AU c21`
- separate operation parts with one space
- use `gate` for a judgment signal
- use `halt` for the stop signal

DERIVATION SET
- use `OBS`, `REA`, `ACT`, `REF`, `QUE`, and `INS` as the six states
- use thirty directed pairs between distinct states
- use stable keys from `d01` through `d30`
- exclude self loops
- read the [derivation set](references/derivation-set.md) for key meanings

COMMUNICATION SET
- use `TX` when the agent sends information
- use `RX` when the agent receives information
- use `K`, `U`, or `X` for known, unknown, or uncertain self state
- use `EK`, `EU`, `AK`, `AU`, or `X` for peer state
- write a communication cell as `K:AU`
- use stable keys from `c01` through `c30`
- map fifteen cells to two directions
- read the [communication set](references/communication-set.md) for key meanings

PENDING
- treat [pending] as local to the current information and direct channel
- stop further communication of that information at the current step
- keep other information and channels available
- do not encode [pending] as a signal
- do not use the stop branch for [pending]

SIGNALS AND BRANCHES
- use `gate` for a judgment row with at least two branch targets
- include `pass` and at least one other named exit in a gate branch
- use `halt` for the stop row with the branch `stop`
- write a normal branch as `next 010`
- separate multiple branch targets with ` | `
- write exit words in lowercase
- use names such as `next`, `pass`, `fail`, `evidence`, `re-reason`, and `unexpected`
- point every branch target to an existing address

REGION MODEL
- keep each region between three and seven rows
- treat eight or nine rows as a warning
- treat fewer than three or more than nine rows as an error
- keep a region loop internal when possible
- give every loop at least one exit edge

BOUNDARIES AND RESULTS
- treat a region as agent-internal while it stays inside itself
- use the direction region as the human boundary
- record unexpected act results as append-only facts
- hang a TODO TREE subtree at the current row when a result changes the context
- move a plan into action only after [consensus]
- use `seek` to consult external sources such as notes, shared material, or tools
- keep [pending] local to its current information and direct channel
- read the [composition rules](references/composition-rules.md) for addresses, comments, regions, boundaries, and verification

WORKFLOW
- format a playbook by running the formatter and then the linter
- check a playbook by treating the linter as the decider
- start with the [template](assets/template.playbook)
- run the linter before calling a playbook ready

FORMAT PLAYBOOK
- run `python3 <skill-dir>/scripts/fmt_playbook.py path/to/manual.playbook` to preview formatting
- run `python3 <skill-dir>/scripts/fmt_playbook.py -i path/to/manual.playbook` to write formatting in place
- let the formatter normalize supported comments and align columns
- let the formatter preserve row order

CHECK PLAYBOOK
- run `python3 <skill-dir>/scripts/lint_playbook.py path/to/manual.playbook`
- use only paths that end with `.playbook`
- let the linter check grammar, key bindings, region sizes, and graph edges
- treat malformed rows, comments, bindings, and graph edges as errors
- treat dangling gotos, unreachable rows, and exitless loops as errors
- use LF line endings in repository files
- treat mixed or missing line endings as errors
- accept uniform CRLF with a warning
- treat style deviations and eight-to-nine row overflow as warnings
- treat exit code `1` as an error result

REFERENCES
- read the [grammar](references/grammar.abnf) for the complete row grammar
- read the [derivation set](references/derivation-set.md) for thirty instruction meanings
- read the [communication set](references/communication-set.md) for thirty instruction meanings
- read the [composition rules](references/composition-rules.md) for addresses, comments, regions, boundaries, and verification

---
