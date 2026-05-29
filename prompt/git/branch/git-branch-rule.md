<!-- prompt/git/branch/git-branch-rule.md -->

This document explains the Git branch naming rules for the project.

```ebnf
(* ========================================================================= *)
(* TOP‑LEVEL: Branch name is either planned work or a community ticket       *)
(* ========================================================================= *)
git-branch-name = topic | ticket ;

(* PLANNED WORK: type / scope-desc *)
topic = type, "/", [ scope, "-" ], desc ;
type  = "feature" | "hotfix" | "perf" ;
scope = identifier ;
desc  = identifier, { "-", identifier } ;

(* COMMUNITY TICKET: issue or discussion / number *)
ticket = ("issue" | "discussion"), "/", number ;
number = ? regex:/[1-9][0-9]*/ ? ;

(* BASICS *)
identifier = ? regex:/[A-Za-z][A-Za-z0-9]*/ ? ;
```

The rules above define all valid branch names for this repository.

---
