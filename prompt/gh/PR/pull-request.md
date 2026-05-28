<!-- prompt/gh/PR/pull-request.md -->
This document defines the Pull Request format for this project.

A Pull Request consists of a `title` and a `description`.

```ebnf
(* ========================================================================= *)
(* TOP‑LEVEL: Pull Request structure                                         *)
(* ========================================================================= *)
pull_request = title, description ;

(* TITLE: Conventional Commits header, used as merge commit message *)
title = type, [ scope ], [ "!" ], ": ", summary ;

type = "feat"
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

scope   = "(", identifier, ")" ;
summary = line ;

(* DESCRIPTION: WHY this change is needed, with optional external links *)
description = motivation, [ eol, supplement ] ;

(* MOTIVATION: bullet list explaining the reason for the change *)
motivation = "MOTIVATION", eol, paragraphs;
paragraphs = paragraph, { paragraph } ;
paragraph  = "- ", line;

(* REFERENCES: optional external resources (issue, PR, discussion, URLs) *)
supplement = "REFERENCES", eol, references;
references = reference, { reference } ;
reference  = "- ", ( "#", number | url ), eol;

(* ========================================================================= *)
(* LEXICAL BASICS                                                            *)
(* ========================================================================= *)
line    = content, eol ;
content = ? regex:/[^\r\n]*/ ? ;
eol     = "\n" | "\r\n" ;

url = ? regex:/[a-zA-Z][a-zA-Z0-9+.-]*:\/\/[^\s]+/ ? ;

number = ? regex:/\d+/ ?
```

This concludes the Pull Request format specification.

---
