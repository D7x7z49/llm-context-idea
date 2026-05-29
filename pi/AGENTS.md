<!-- pi/AGENTS.md -->
<!-- pi ecosystem development notes — conventions for extensions, skills, and tooling. -->

PACKAGE MANAGEMENT

- never edit `package.json` dependencies by hand.
- use `npm install -D <pkg>` for workspace root dev dependencies.
- use `npm install -w <name> <pkg>` for extension-specific dependencies.
- check `package-lock.json` after install — version ranges must match resolved versions.

SCRIPTS

- `npm test` runs unit tests across all workspaces.
- `npm test -w pi-wal` runs tests for a single extension.
- `npm run test:integration` runs integration tests across all workspaces.
- `npm run format` applies prettier to all source files.
- `npm run check` runs `tsc --noEmit` for type checking.

CODE STYLE

- english for all text in git: comments, commit messages, docs.
- two-space indent for typescript, json, toml, yaml, markdown.
- prettier at workspace root handles all formatting.

EXTENSION STRUCTURE

- each extension lives under `extensions/<name>/`.
- `package.json` declares `"pi": { "extensions": ["./src/index.ts"] }`.
- `src/index.ts` exports a default function receiving `ExtensionAPI`.
- tests under `test/` use `node:test` with `tsx --test` loader.
- file pattern: `*.unit.test.ts` for unit, `*.integration.test.ts` for integration.

TESTING

adapted from [workflow-as-list test/README.md](https://github.com/D7x7z49/workflow-as-list/blob/main/test/README.md).

- write tests that verify necessary conditions only.
- no test suite covers infinite input space.
- v0 phase: keep tests minimal. structure changes frequently — over-testing creates drag.
- v1 phase: when code stabilizes, add coverage to lock behavior.

before committing a test, ask:

- without this test, does your confidence in key logic drop?
- on failure, must you fix immediately or can it wait?
- three months later, will you understand why this test exists?
- where would the system break if you delete this test?
- are you testing logic or implementation details?

test types by scope:

- unit: `*.unit.test.*` — one test per branch, no external calls, in-memory fakes.
- component: `*.component.test.*` — public interface main scenarios, critical exceptions.
- integration: `*.integration.test.*` — only actually used component combinations, mock at boundaries.
- e2e: `*.e2e.test.*` — five to fifteen workflows with direct business impact.

for external dependencies, mock according to test type.
unit: no external calls. component: stub all externals. integration: mock at boundaries.
e2e: real dependencies in controlled environment.

do not treat coverage as a goal. use coverage only to find uncovered high-importance inputs.

VERSIONING

- workspace root uses `"^major.minor.patch"` ranges matching the lock file.
- extensions declare `peerDependencies` with `"*"` for pi core packages.
- pi core packages (`@earendil-works/pi-coding-agent`, `@earendil-works/pi-tui`, `typebox`) are provided by the runtime.

---
