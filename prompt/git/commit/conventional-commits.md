<!-- prompt/git/commit/conventional-commits.md -->
`Conventional Commits` strict subset rules explained.

This is a stricter subset of the `Conventional Commits v1.0.0` specification.
```ebnf
(* ========================================================================= *)
(* TOP‑LEVEL STRUCTURE                                                        *)
(* ========================================================================= *)

git_commit_message = header, [ body ], [ footer ] ;

(* ========================================================================= *)
(* HEADER                                                                     *)
(* ========================================================================= *)

header = type, [ scope ], [ "!" ], ": ", line ;
type   = "feat"
       | "fix"
       | "docs"
       | "style"
       | "refactor"
       | "perf"
       | "test"
       | "build"
       | "ci"
       | "chore"
       | "revert"
       ;
scope  = "(", identifier, ")" ;

(* ========================================================================= *)
(* BODY                                                                       *)
(* ========================================================================= *)

body = eol, body_entries ;

body_entries = body_entry, { body_entry } ;
body_entry   = "- ", line ;

(*
  Each body entry is exactly one line. Do not wrap.
  Split long points into shorter entries.
*)

(* ========================================================================= *)
(* FOOTER                                                                     *)
(* ========================================================================= *)

footer = eol, footer_entries ;

footer_entries = footer_entry, { footer_entry } ;
footer_entry   = mark, ": ", line ;

(*
  NONE.
  - BREAKING-CHANGE: describes a breaking change in more detail.
  - REFERENCE: a GitHub-style #number, a full <link>, or a short commit hash.
*)
mark = "BREAKING-CHANGE" | "REFERENCE" ;

(* ========================================================================= *)
(* BASIC ELEMENTS                                                             *)
(* ========================================================================= *)

identifier = ? regex:[A-Za-z][A-Za-z0-9-]* ? ;

line    = content, eol ;
content = ? regex:/[^\n\r]*/ ? ;
eol     = "\n" | "\r\n" ;
```

This defines the strict subset convention of `Conventional Commits`.

---
