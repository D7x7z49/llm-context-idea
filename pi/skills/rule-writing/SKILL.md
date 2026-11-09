---
name: rule-writing
description: >
  write, review, or lint a rule set shared by an agent and a human.
  use when a convention file or a prompt template must stay bounded, positive, and verifiable.
---
<!-- pi/skills/rule-writing/SKILL.md -->
<!-- NOTE: meta rules that turn a message into a rule set both parties share. -->

PREAMBLE
- produce a rule set shared by agent and human
- keep the rule set bounded, positive, and verifiable
- apply to a convention file, a prompt, an agents file, a project rule
- apply to one rule at a time and to the set as a whole
- exclude a narrative document, a single example, a status record, an event log

RULE FORM
- name the universe before the target set
- state a rule as a finite target set over the universe
- derive the forbidden set as the complement of the target set
- reach agreement on the universe and the target set
- when the target set is unclear, mark the rule as [pending]
- confirm the target with the peer at [pending]
- identify the positive target before a negation

RULE CONTENT
- carry one concept in one rule
- keep a concept stable when the file structure changes
- separate a concept from a state, an example, and an instance
- place a pointer in the rule and the substance in a file
- write the rule in an imperative sentence
- write the rule in simple words
- expand an abbreviation at its first occurrence

RULE LAYOUT
- keep one item on one line
- end a line at `,` or `.`
- write body text in lowercase, with uppercase for a term and a marker
- nest a level with paired delimiters
- place a local name in `[]` and an external reference in `<>`
- use a structural character only when a mainstream input method types it directly
- keep rule text free of a heading and a colon
- open a code block with a typed fence

RULE MAINTAIN
- open the file with a path line and a note line
- close a section with `---`
- keep a section within seven plus or minus two items
- keep the rule set within seven plus or minus two sections
- keep the rule file within sixty four lines
- let a later rule override an earlier rule
- record a change outside the rule set

REFERENCES
- read the [form notes](references/form.md) for the universe and the pending path
- read the [layout notes](references/layout.md) for the symbol set and the file shape
- read the [check list](references/checklist.md) for a runnable review
- run the [lint script](scripts/lint_rules.py) for the mechanical checks
- treat the references as supporting material

---
