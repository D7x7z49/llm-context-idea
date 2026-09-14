<!-- references/derivation-set.md -->

(*
  SET.
  - 30 directed pairs.
  - self loops are excluded.
*)

STATES: OBS (observe), REA (reason), ACT (act), REF (reflect), QUE (question), INS (inspire)

(*
  RECORDS.
  - index by pair.
  - each entry says when to use the move.
*)

OBS -> REA  01 use when fresh observation must become structured inference
OBS -> QUE  02 use when observation contains contradiction or gap
OBS -> INS  03 use when observation suggests an untested analogy
OBS -> ACT  04 use when observation alone already warrants a minimal action
OBS -> REF  05 use when observation ends a segment and needs judgment

REA -> OBS  06 use when inference exposes that more evidence is needed
REA -> ACT  07 use when inference reaches a testable conclusion
REA -> QUE  08 use when inference opens a new unknown
REA -> INS  09 use when inference touches a familiar pattern worth leap
REA -> REF  10 use when inference reaches a citable conclusion

ACT -> OBS  11 use when action returns a result that must be inspected
ACT -> REA  12 use when action result changes the model
ACT -> QUE  13 use when action result contradicts the plan
ACT -> REF  14 use when action completes a step
ACT -> INS  15 use when action output suggests a shortcut

REF -> OBS  16 use when review finds missing evidence
REF -> REA  17 use when review finds a weak premise
REF -> ACT  18 use when review finds the fix and approves action
REF -> QUE  19 use when review cannot decide and must mark pending
REF -> INS  20 use when review recalls an analogous case

QUE -> OBS  21 use when the question needs facts before reasoning
QUE -> REA  22 use when the question is answerable by inference alone
QUE -> ACT  23 use when the question is answerable only by experiment
QUE -> REF  24 use when the question closes with a recorded judgment
QUE -> INS  25 use when the question invites associative search

INS -> OBS  26 use when a leap creates a candidate hypothesis to verify
INS -> REA  27 use when a leap needs formal grounding
INS -> ACT  28 use when a leap is cheap enough to try directly
INS -> REF  29 use when a leap is recorded as open or rejected
INS -> QUE  30 use when a leap raises the next unknown

(*
  NOTES.
  - an entry is a legal move only, not a recommendation.
  - personality is the priority order of outgoing edges per state.
  - self loops are excluded: 6 x 5 = 30.
*)
