---
name: communication-standard
description: >
  keep any exchange between two parties on common ground, so knowledge is shared and the topic moves toward a decision.
  use when composing, reading, or revising a message, a dialogue, or a group thread.
---
<!-- pi/skills/communication-standard/SKILL.md -->
<!-- NOTE: guide two-party communication that reduces uncertainty and moves a topic forward. -->

PURPOSE
- reduce uncertainty between two parties
- synchronize knowledge before action
- move the current topic toward [consensus] or [pending]
- govern communication first and use writing style to support communication

SCOPE
- apply this standard to agent-agent chat, dialogue, and message passing
- apply this standard to agent-human chat, dialogue, and message passing
- treat a group exchange as separate two-party channels
- apply the standard to one direct channel at a time
- exclude creative writing, persuasion, and long-form human writing when uncertainty reduction is not the main goal

CHANNEL SCOPE
- treat one matrix result as local to one information item on one direct channel
- observe a multi-system exchange as multiple direct channels
- keep the result local to its information and channel

CORE LAW
- rely on [common ground] for every communication
- model each party as a knowledge set of known propositions
- define [common ground] as the intersection of both knowledge sets
- MUST state every relation that the receiver needs to interpret the message
- use the message itself to add new information instead of relying on unshared context
- make the intended meaning explicit when private knowledge would complete it

FAILURES AND REMEDY
- treat a bare negation such as `not X` as incomplete when its complement and universe are unstated
- expect each party to compute an unstated complement over its own knowledge set
- recognize that this mismatch can hide information that neither party has examined
- avoid honest deception, where true partial statements lead to a false whole
- state the omitted part explicitly and positively when the target can be identified

MODEL BOUNDARY
- use the issue tree to classify message intent as [task], [question], [condition], or [none]
- use the communication matrix to classify knowledge alignment
- keep message intent and knowledge alignment as separate models
- keep an issue tree type separate from a matrix cell and outcome
- treat `idea/issue-tree.md` as background for the intent model

COMMUNICATION MATRIX
- model the sender's state for a proposition as [known], [unknown], or [uncertain]
- label the peer state as [explicitly known], [explicitly unknown], [assumed known], [assumed unknown], or [uncertain]
- form one cell from one self state and one peer state
- treat the three by five axes as fifteen cells
- write a cell as `self:peer`

OUTCOMES
- record [consensus] when both parties align on the proposition
- allow execution only after [consensus]
- record [hidden] when the sender knows and the receiver has stated that the proposition is unknown
- record [blind spot] when the sender does not know and the receiver has stated that the proposition is known
- record [unknown] when neither party knows the proposition
- record [pending] when either party is uncertain about the proposition
- treat [pending] as a local communication outcome, not as an answer
- stop the current communication when its information is [pending]
- keep other information, channels, and systems outside that local result

ACTIONS
- use [check] when the sender knows and assumes that the receiver knows
- verify the assumption during [check]
- record [consensus] when [check] succeeds
- use [hint] when the sender knows and assumes that the receiver does not know
- provide the missing information during [hint]
- use [ask] when the sender does not know and assumes that the receiver knows
- request the information during [ask]
- use [seek] when the sender does not know and assumes that the receiver does not know
- search external sources during [seek]

MAPPING
- map [known] with [explicitly known] to [consensus]
- map [known] with [explicitly unknown] to [hidden]
- map [known] with [assumed known] to [check]
- map [known] with [assumed unknown] to [hint]
- map [unknown] with [explicitly known] to [blind spot]
- map [unknown] with [explicitly unknown] to [unknown]
- map [unknown] with [assumed known] to [ask]
- map [unknown] with [assumed unknown] to [seek]
- map every uncertain self state to [pending]
- map every uncertain peer state to [pending]

NEGATION HANDLING
- treat an unexplained negation as a signal that [common ground] is incomplete
- identify the positive target behind the negation
- express the target as a finite subset when the target can be identified
- mark the information as [pending] when no positive target can be identified
- stop the current communication when that information is [pending]

LIFECYCLE
- open a topic with [check], [hint], [ask], or [seek]
- exchange information during synchronization
- reduce uncertainty and update the matrix after each relevant exchange
- confirm shared understanding before reaching [consensus]
- begin execution only after [consensus]
- stop the current information exchange when the result is [pending]
- keep other information and channels active when one result is [pending]
- refine scope, gather information, switch topics, or shelve the topic after [pending]
- reopen a settled topic only when new information appears

INTENT BLOCKS
- write a document as a sequence of intent blocks
- make each block advance one sub-goal
- keep a context or reasoning paragraph to at most three sentences
- put one claim, action, or constraint in each list item
- read the [writing rules](references/writing-rules.md) for detailed expression rules

QUALITY CHECK
- run this check before sending a message
- identify a clear intent and a matrix outcome
- rely on [common ground] and state every required relation explicitly
- place conditions before actions and make referents known
- state the positive target of a negation or defer the information to [pending]
- keep one topic at a time and advance one sub-goal
- reduce uncertainty and move the topic forward
- move every direct communication toward [consensus] or [pending] for its current information

REFERENCES
- read the [writing rules](references/writing-rules.md) for prose, layout, and constraint keywords
- read the [theoretical basis](references/theoretical-basis.md) for research terms and limits
- treat the references as supporting material, not as replacements for the core protocol

---
