---
name: communication-standard
description: >
  Apply when composing chat or dialogue messages in a two-party channel,
  agent to agent or agent to human. Use it to keep each message single in
  intent, explicit in scope, and grounded in shared knowledge, so the
  exchange reduces uncertainty and moves a topic forward. Do not apply it
  to creative writing, persuasion, or human-facing long-form text, where
  goals other than uncertainty reduction take priority.
---

# Communication Standard

a standard for how two parties exchange information to reduce uncertainty and
move a topic forward. it governs communication first, and writing style only
in service of communication.

this document is a Condition block. it follows its own rules, so it also
serves as an example.

---

## Scope

apply this standard only to a two-party exchange whose goal is to synchronize
knowledge. read this section before the rest, since it sets the premise.

- use it for chat, dialogue, and message passing between two agents, or
  between an agent and a human.
- treat any group exchange as a set of two-party channels, and apply the
  standard to one channel at a time.
- for creative writing, persuasion, or long-form text meant for human reading,
  defer to the goals of that medium. this standard optimizes for clarity, not
  for aesthetics or influence.

---

## Core Law

communication is safe only when it relies on shared knowledge. this is the one
rule the rest of the document serves.

- model each side as a knowledge set, and treat their intersection as the
  common ground.
- a message MUST carry enough that the receiver can reconstruct its meaning
  from the common ground alone.
- if a message forces the receiver to complete it over unshared knowledge,
  meaning drifts in silence, and both sides still believe they agree.

two named failures break this law. guard against both.

- silent complement. a negation `not X` leaves the receiver to take a
  complement over an unstated universe. each side computes it over its own
  set, and the mismatch hides where neither side looks.
- honest deception. a chain of true but partial statements lets the receiver
  complete a false whole. every sentence is true, yet the completion lands
  outside the common ground.

both failures share one cure. move the part left for completion into the
message, as explicit and positive content.

---

## Epistemic Types

every intent block carries exactly one type. decide the type before writing.

each type comes from two judgments by the sender: the sender's own knowledge
of a proposition, and the sender's presupposition about the receiver's
knowledge. the first three types are constructive, since each selects and
points to a definite subset. None is the non-constructive remainder.

- Question. sender unknown, receiver assumed known. use it to request missing
  information. a single side MAY raise it.
- Condition. sender known, receiver assumed unknown. use it to deliver rules,
  assumptions, constraints, or background. it narrows scope, and a single side
  MAY raise it.
- Task. drawn from Question and Condition once both sides confirm the needed
  knowledge. use it for a shared conclusion that closes uncertainty and opens
  action. it holds only when both sides agree, so it is the one point where
  common ground MUST be truly built.
- None. the complement of the other three. use it to hold noise, unclear
  intent, and content that resists conversion to a positive type.

---

## Negation Handling

a negation signals that common ground is not yet built. treat it as an opening
to synchronize, not as a finished statement.

- when a message carries negative intent, raise a Question that helps the
  sender name the positive target behind it.
- convert `do not do X` into `do Y`, so the receiver gains a small, definite
  subset instead of an open complement. logic offers the mechanics, through
  contraposition and De Morgan's laws, but the goal is always a positive
  target.
- if a negation resists conversion, mark it None and defer it, rather than
  passing an untrustworthy complement downstream.

---

## Lifecycles

manage a topic and the None buffer as state over time.

- open a topic with a Question or a Condition, exchange until both sides
  confirm, then draw a Task to close it.
- hold a resolved topic as settled, and reopen it only when new information
  arrives.
- route noise, unclear intent, and unconverted negation into None, and give
  each None entry a review deadline.
- on review, convert a None entry into a Question, Condition, or Task, or
  discard it. expired entries drop, so None never grows into a dump.

---

## Intent Blocks

a document is a sequence of intent blocks. each block advances one sub-goal.

an intent block contains one paragraph and an optional list.

- keep the paragraph to three sentences at most. use it to set context or give
  reasoning.
- use the list to deliver actions, facts, or constraints, one claim per
  bullet.
- separate blocks with a blank line.

---

## Writing Rules

writing exists to expose meaning with the least ambiguity. choose clarity
before elegance, and keep brevity subordinate to readability. if brevity
breaks understanding, readability wins.

### Subject

- omit the subject in list items when the actor is already known.
- start each list item with a verb.
- prefer `create the cache.` over `the system should create the cache.`

### Conditions

- place the condition clause before the action, so the reader narrows scope
  before the action appears.
- prefer `if validation fails, return an error.` over
  `return an error if validation fails.`
- use `if` for a sufficient condition, and `only if` for a necessary one.

### Relations

- express every relation with a natural word.
- use `if`, `unless`, `because` for logic.
- use `before`, `after`, `when` for order and time.
- use `from`, `to`, `with`, `without` for structure.
- prefer these words over symbols such as arrows, equals, or plus.

### Rhythm

- use a comma to separate a condition from its action, or to pace steps in a
  sequence.
- use a period to end one complete assertion.
- default to lowercase. reserve uppercase for keywords defined in
  Constraint Strength, or for terms that need weight.

### Terms

- on first use, write an abbreviation as its full name in PascalCase, followed
  by the short form in parentheses, as in Common Ground (CG).
- keep one term for one concept across the whole document.
- prefer common words over rare ones, and write for predictable interpretation
  over stylistic variation.

### Markdown

- use markdown for structure: headings, horizontal rules, lists, inline code,
  links, images.
- prefer nested lists and plain wording over tables and emphasis marks.
- write relations as words rather than arrows or emojis.

---

## Constraint Strength

mark rule weight with the keywords from RFC 2119, in full caps. the three
below are self-contained; fetch RFC 2119 for the full normative text.

- MUST, MUST NOT. an absolute requirement or prohibition.
- SHOULD, SHOULD NOT. a strong preference, with deviation allowed for a known
  tradeoff.
- MAY. truly optional.

state a prohibition together with the positive alternative that replaces it,
so a rule points to a target instead of an open complement.

---

## Quality Check

run this pass before sending. it repeats the key points, so treat it as the
final gate.

- clear intent. each block has one determinable type.
- shared ground. each message relies only on the common ground, and leaves no
  gap to complete over unshared knowledge.
- explicit scope. conditions come first, and referents are known.
- positive form. constraints name a target, and negations are converted or
  deferred to None.
- one topic at a time. each block advances a single sub-goal.
- forward progress. every block moves the conversation, or it is deleted.

every message SHOULD help synchronize knowledge. every document SHOULD reduce
uncertainty.

---

## Appendix: Theoretical Basis

these are the established results this standard rests on. read them to
understand why the rules hold. skip them to apply the rules, since the body
is self-contained.

each entry names a field and the specific results it contributes, as keywords
for further study.

- information theory. `Shannon entropy`, `mutual information`. grounds the view
  that information is the reduction of uncertainty, behind Core Law and the
  forward-progress check.
- set theory. `set complement`, `symmetric difference`. grounds why a negation
  is untrustworthy, and frames scope as contraction toward a definite subset.
- cybernetics. `Shannon–Weaver model`, `Ashby's law of requisite variety`,
  `feedback`. grounds the sender-channel-receiver picture, and locates silent
  drift in the difference between two knowledge sets.
- logic. `contraposition`, `De Morgan's laws`, `law of excluded middle`.
  grounds the mechanics of converting a negation into a positive target.
- pragmatics. `Grice's cooperative principle`, `maxim of quantity`,
  `conversational implicature`, `paltering`. grounds honest deception: true but
  partial statements that mislead by violating quantity, not quality.
- constructive logic. `constructive vs non-constructive proof`,
  `Curry–Howard correspondence`, `negation as ¬P ≡ P → ⊥`. grounds why
  Question, Condition, and Task are constructive, while None is the
  non-constructive remainder.

the constraint keywords follow `RFC 2119`. an agent MAY fetch the source
document for the full normative text, though the definitions in Constraint
Strength stand on their own.
