<!-- references/composition-rules.md -->

rules for composing a playbook manual. the rules describe the
invariants that lint_playbook.py checks and that fmt_playbook.py
preserves. grammar.abnf defines one row; this file defines the whole.

FILE MODEL

- a manual file carries the `.playbook` suffix.
- both tools accept only that suffix, so a prose document cannot be
  mistaken for a manual.

LINE ENDINGS

- the grammar accepts LF and CRLF, but repository files use LF.
- fmt_playbook.py writes LF output.
- lint_playbook.py treats mixed or missing endings as errors and reports
  uniform CRLF as a warning.

COMMENT STYLE

- a short label uses one line: `(* text *)`, with no padding.
- a section banner has three lines: a rule line of 74 "=" signs, one
  title line padded to end at column 80, and the closing rule line.
- a logical note uses the block form: `(*` alone, body lines indented
  by two, and `*)` alone.
- put an upper-case heading and a period on the first line of each
  small logical area; separate areas with a blank line.
- use a block for a region description instead of a long one-line
  comment. keep bullets and sentence breaks visible.
- the formatter normalizes marker spacing, banner geometry, and block
  indentation without rewriting the comment's logical line breaks.
- lint_playbook.py reports malformed comments as errors and style deviations
  as warnings.

ADDRESS MODEL

- one address is three decimal digits.
- the hundreds digit is the region. a region is one autonomy zone.
- the tens digit is the row order inside the region.
- the ones digit is a reserved slot for inserting a row later.
- interleaved gaps prevent renumbering: 000, 100, 200 leave room for 010.

ROW MODEL

- one row is one minimal work unit.
- a row is self contained: it carries its own address, label,
  operation, and branch.
- writing rule: write the current row only, do not anticipate the loop.
- pointer semantics: the agent reads one row, executes its operation,
  then moves exactly where the branch says.

REGION RULES

- one region holds 3 to 7 rows.
- the comfort size is 7: miller 7 plus or minus 2, with two slots kept
  for expansion.
- the minimum size is 3: a closed loop needs a state, a transform, and
  a judgment.
- the hard maximum is 9: one decimal digit of row order.
- a region loops internally, and every loop carries at least one exit
  edge.

OPERATION RULES

- an operation encodes one instruction of the two 30-entry sets.
- a derivation row writes the edge and its key: `REF -> OBS d16`.
- a communication row writes direction, cell, and key: `RX K:AU c21`.
- `gate` is a REF judgment row. its branch lists pass and one or more
  named exits, for example `pass 100 | fail 000`.
- `halt` is the stop row. its branch is `stop`.

BOUNDARY RULES

- a region is agent internal as long as it stays inside itself.
- the only human boundary is the direction region: rows there receive
  a direction or report a result.
- a direction entry may carry a pre-authorization so the whole batch
  runs without interruption.

UNEXPECTED RESULTS

- an unexpected act result is recorded as a fact in the draft,
  append only.
- hang a TODO TREE subtree at the current row, then return to the
  reasoning region with the new context.
- never undo a recorded fact.

CONSENSUS

- only consensus moves a plan into action.
- seek means consulting external sources: notes, share, apiscope,
  toolchain.
- pending means pause, sort, or re-plan.

VERIFICATION

- the agent does not reason about loop correctness from its head.
- lint_playbook.py checks syntax, bindings, region sizes, and the
  graph: dangling gotos, unreachable rows, exitless loops.
- a manual is verified only when lint reports no errors.
