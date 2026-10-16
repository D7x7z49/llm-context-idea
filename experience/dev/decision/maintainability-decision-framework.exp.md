<!-- experience/dev/decision/maintainability-decision-framework.exp.md -->
<!-- NOTE: help your future self choose a clear and maintainable path. -->

STEP.
- identify the long-term maintenance risk before choosing a locally convenient implementation
- treat source code as communication between current and future maintainers
- reduce uncertainty about intent with common, explicit, and consistent forms
- choose one canonical mechanism when several mechanisms solve the same purpose
- keep one authoritative source for each behavior, rule, and configuration value
- reject hidden semantics and extra interpretation channels unless they provide essential value
- treat text read by a framework, tool, or agent as metadata rather than a pure comment
- use comments only for non-obvious intent, constraints, or side effects
- evaluate the choice by the probability that a future maintainer can understand and change it safely

NOTE.
- keep this as a decision framework, not a universal ban on abstraction or language features
- choose long-term clarity over local brevity when brevity increases system-wide uncertainty
- keep documentation, generated output, and source code from becoming competing authorities
- use useful inert comments to preserve intent without repeating obvious code
- include future maintainers, agents, dependency upgrades, and team handoffs in the decision context
- preserve maintainability because a program that cannot be understood cannot be safely extended

---
