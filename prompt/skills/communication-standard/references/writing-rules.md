<!-- prompt/skills/communication-standard/references/writing-rules.md -->
<!-- NOTE: detailed rules for expressing a communication standard with low ambiguity. -->

PURPOSE
- use these rules when a message needs precise, readable, and maintainable wording
- keep communication rules subordinate to uncertainty reduction

WRITING GOAL
- expose meaning with the least ambiguity
- prefer clarity over elegance
- prefer readability over brevity

INTENT BLOCKS
- write a document as a sequence of intent blocks
- make each block advance one sub-goal
- keep a context or reasoning paragraph to at most three sentences
- use an optional list for claims, actions, or constraints
- put one claim, action, or constraint in each list item
- separate intent blocks with one blank line

SUBJECTS
- omit the subject when the actor is already known
- begin each list item with a verb
- prefer `create the cache` to `the system should create the cache`

CONDITIONS
- place the condition clause before the action
- use `if` for a sufficient condition
- use `only if` for a necessary condition
- write `if validation fails, return an error` instead of `return an error if validation fails`

RELATIONS
- express every relation with a natural word
- use `if`, `unless`, and `because` for logic
- use `before`, `after`, and `when` for order and time
- use `from`, `to`, `with`, and `without` for structure
- prefer words to arrows, equals signs, plus signs, or emojis

RHYTHM
- use a comma to separate a condition from its action
- use a period to end one complete assertion
- use lowercase by default
- reserve uppercase for section labels, proper names, abbreviations, and constraint keywords

TERMS
- wrap local identifiers in square brackets, such as [common ground]
- keep one term for one concept across the whole document
- prefer common words to rare words
- preserve the conventional case of abbreviations and proper names

MARKDOWN
- use section labels, horizontal rules, lists, inline code, links, and images for structure
- prefer plain wording to tables and emphasis marks
- write relations as words instead of arrows or emojis
- use commonmark inline code for paths and commands
- use commonmark link syntax for links

CONSTRAINT STRENGTH
- use the keywords from <RFC 2119> in full caps
- use MUST for an absolute requirement
- use MUST NOT for an absolute prohibition
- pair MUST NOT with the positive alternative that replaces it
- use SHOULD for a strong preference that allows a known tradeoff
- use SHOULD NOT for a strong preference against a practice
- use MAY for a truly optional action

---
