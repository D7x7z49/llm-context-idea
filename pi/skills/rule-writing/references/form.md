<!-- pi/skills/rule-writing/references/form.md -->
<!-- NOTE: why a rule needs a stated universe and a positive target set. -->

UNIVERSE
- treat the universe as the finite domain under discussion
- name the universe first, so both parties share the same domain
- keep the universe finite, so a complement is computable
- update the universe when the domain grows

TARGET SET
- state a rule as a finite target set over the universe
- enumerate the target set, so a peer can check membership
- keep one shape per member, so membership is mechanical

COMPLEMENT
- derive the forbidden set as the complement of the target set
- expect each party to compute its own complement from a private knowledge set
- expect two complements to differ on the same negation
- expect an unstated complement to hold elements neither party examined
- expect a true partial statement to imply a false whole
- reach agreement on the universe and the target set before a negation is used

PENDING PATH
- mark the rule as [pending] when the target set is unclear
- stop the rule at [pending] and confirm the target with the peer
- state the target as a finite subset once identified
- reopen a settled rule only when new information appears

NEGATION
- identify the positive target behind a negation
- write the negation as the identified target
- keep the negation only when the target is already shared
- avoid an enumerated forbidden list, because it enumerates a complement and grows without bound

---
