---
name: communication-standard
description: >
  a standard for two-party information exchange that reduces uncertainty and
  moves a topic forward. it governs communication first, and writing style
  only in service of communication.
---

Communication Standard
---

a standard for how two parties exchange information to reduce uncertainty.
it also covers how to move the topic forward.
it governs communication first,
and writing style only in service of communication.

```yaml
scope:
  apply_to:
    - agent-agent chat, dialogue, and message passing
    - agent-human chat, dialogue, and message passing
  group_treatment:
    treat any group exchange as a set of two-party channels.
    apply the standard to one channel at a time.
  exclude:
    - creative writing
    - persuasion
    - human-facing long-form text where goals other than uncertainty reduction take priority

core_law:
  statement:
    communication is safe only when it relies on [common ground].
  definitions:
    knowledge_set:
      each party is modeled as a set of known propositions.
    common_ground:
      the intersection of both knowledge sets.
  requirement:
    a message MUST carry enough that the receiver can reconstruct its
    intended meaning from [common ground] alone.
  failures:
    silent_complement:
      cause:
        a negation such as `not X` leaves the receiver to infer an unstated
        complement over an unstated universe.
      effect:
        each side computes the complement over its own set.
        the mismatch hides where neither side looks.
    honest_deception:
      cause:
        a chain of true but partial statements.
      effect:
        the receiver completes a false whole.
        every sentence is true, yet the completion lands outside [common ground].
  remedy:
    move the part left for completion into the message as explicit and
    positive content.

model_boundary:
  issue_tree:
    an earlier design (idea/issue-tree.md) types a message as task,
    question, condition, or none.
    those types describe message intent.
    they do not describe knowledge alignment.
  rule:
    do not map an issue tree type to a cell or an outcome.
    the two models are orthogonal.
    each model is used on its own.

communication_matrix:
  axes:
    self_state:
      - known
      - unknown
      - uncertain
    peer_state:
      - explicitly_known
      - explicitly_unknown
      - assumed_known
      - assumed_unknown
      - uncertain
  cells:
    definition:
      one cell is one pair of self_state and peer_state.
      the 3 x 5 axes give 15 cells.
      a cell is written as self:peer.
  outcomes:
    consensus:
      description:
        both sides are aligned on the proposition.
        execution MAY proceed.
    hidden:
      description:
        sender knows.
        receiver explicitly does not know.
    blind_spot:
      description:
        sender does not know.
        receiver explicitly knows.
    unknown:
      description:
        neither side knows.
    pending:
      description:
        at least one side is uncertain.
        pause the topic until uncertainty is reduced.
        [pending] is not an answer.
        it is a decision to pause, defer, adjust scope, or obtain additional information.
  actions:
    check:
      trigger: known + assumed_known
      description:
        sender knows.
        sender assumes receiver knows.
        verify the assumption.
        on success, record [consensus].
    hint:
      trigger: known + assumed_unknown
      description:
        sender knows.
        sender assumes receiver does not know.
        provide information.
    ask:
      trigger: unknown + assumed_known
      description:
        sender does not know.
        sender assumes receiver knows.
        request information.
    seek:
      trigger: unknown + assumed_unknown
      description:
        sender does not know.
        sender assumes receiver does not know.
        search for information through external sources.
  mapping:
    - known + explicitly_known -> consensus
    - known + explicitly_unknown -> hidden
    - known + assumed_known -> check
    - known + assumed_unknown -> hint
    - unknown + explicitly_known -> blind_spot
    - unknown + explicitly_unknown -> unknown
    - unknown + assumed_known -> ask
    - unknown + assumed_unknown -> seek
    - uncertain + any -> pending
    - any + uncertain -> pending

negation_handling:
  principle:
    a negation signals that [common ground] is not yet built.
    treat it as an opening to synchronize, not as a finished statement.
  procedure:
    - identify the positive target behind the negation.
    - express the target directly as a finite subset.
    - if no positive target can be identified, mark the topic [pending] and defer further processing.

lifecycle:
  topic:
    open:
      begin with [check], [hint], [ask], or [seek].
    synchronize:
      exchange information.
      reduce uncertainty.
      update the matrix.
    consensus:
      confirm shared understanding.
      execution MAY begin only after [consensus].
    pending:
      pause the topic.
      then refine scope, gather additional information, switch topics, or shelve the topic.
    reopen:
      reopen a settled topic only when new information appears.

intent_blocks:
  structure:
    a document is a sequence of intent blocks.
    each block advances one sub-goal.
  content:
    paragraph:
      at most three sentences.
      provides context or reasoning.
    list:
      optional.
      one claim, one action, or one constraint per item.
  separation:
    one blank line between blocks.

writing_rules:
  goal:
    expose meaning with the least ambiguity.
    prefer clarity over elegance.
    prefer readability over brevity.
  subject:
    omit the subject when the actor is already known.
    begin each list item with a verb.
    prefer `create the cache` over `the system should create the cache`.
  conditions:
    place the condition clause before the action.
    use `if` for a sufficient condition, and `only if` for a necessary one.
    prefer `if validation fails, return an error` over `return an error if validation fails`.
  relations:
    express every relation with a natural word.
    for logic use `if`, `unless`, `because`.
    for order and time use `before`, `after`, `when`.
    for structure use `from`, `to`, `with`, `without`.
    prefer words over symbols (arrows, equals, plus).
  rhythm:
    use a comma to separate a condition from its action.
    use a period to end one complete assertion.
    default to lowercase.
    reserve uppercase for constraint keywords.
  terms:
    on first use write the full name in PascalCase followed by the short form in square brackets, as in [common ground].
    keep one term for one concept across the whole document.
    prefer common words over rare ones.
  markdown:
    use markdown headings, horizontal rules, lists, inline code,
    links, and images for structure.
    prefer nested lists and plain wording over tables and emphasis marks.
    write relations as words rather than arrows or emojis.

constraint_strength:
  source:
    keywords from (RFC 2119), in full caps.
  definitions:
    MUST:
      absolute requirement.
    MUST_NOT:
      absolute prohibition.
      pair with the positive alternative that replaces it.
    SHOULD:
      strong preference.
      deviation is allowed for a known tradeoff.
    SHOULD_NOT:
      strong preference against.
    MAY:
      truly optional.

quality_check:
  gate:
    run this check before sending a message.
  items:
    - clear intent. the matrix outcome is identifiable.
    - shared ground. the message relies only on [common ground] and leaves no gap to complete over unshared knowledge.
    - explicit scope. conditions come first and referents are known.
    - positive form. every negation is converted or deferred to [pending].
    - one topic at a time. the message advances exactly one sub-goal.
    - forward progress. the message reduces uncertainty and moves the topic forward.
  summary:
    every message SHOULD help synchronize knowledge.
    every conversation SHOULD move toward [consensus] or [pending].

appendix:
  theoretical_basis:
    purpose:
      established results the standard rests on.
      keywords for further study.
    fields:
      information_theory:
        Shannon entropy, mutual information
      set_theory:
        set complement, symmetric difference
      cybernetics:
        Shannon-Weaver model, Ashby's law of requisite variety, feedback
      logic:
        contraposition, De Morgan's laws, law of excluded middle
      pragmatics:
        Grice's cooperative principle, maxim of quantity, conversational implicature, paltering
      constructive_logic:
        constructive vs non-constructive proof, Curry-Howard
        correspondence, negation as not-P entails P implies
        contradiction
  constraint_keywords:
    follow (RFC 2119).
    an agent MAY fetch the source document for the full normative text.
```

communication standard documentation end.
