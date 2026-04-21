# Script as Native Extension: From Shell Commands to Reusable Artifacts

## 1. Problem Statement

- Agents often use a generic shell tool to run commands. This leads to three recurring problems.
- First, complex pipelines fail midway without built-in idempotency. The agent retries and rewrites the same command fragments, bloating the context window.
- Second, commands exist only as raw strings in the conversation history. There is no persistent record of what worked, what failed, or why. Experience does not accumulate across sessions.
- Third, long-running or background commands can block the agent loop. The shell tool waits for completion and may time out or hang.

- Many agent frameworks now offer script hubs. They provide prewritten scripts for common tasks. However, they still rely on the same shell tool model. They do not rethink the atomic interface between the agent and the operating system.

## 2. Core Idea and Differentiation

- This design replaces the generic shell tool with a script interpreter tool. The agent no longer runs ad-hoc commands. It either selects an existing script or writes a new one. The interpreter executes the script and returns a result.

- The difference from existing script hubs is fundamental.
  - Existing hubs extend the tool catalog. This design changes the interaction primitive.
  - Existing hubs focus on covering more use cases. This design focuses on idempotency, atomicity, and observability as prerequisites for compound growth.
  - Existing hubs treat scripts as external resources. This design makes the script file path itself a meaningful prompt that the agent can parse.

## 3. Idempotency, Atomicity, Observability

- These three properties turn a one-time action into a reusable asset.

- Idempotency means a script can be run multiple times without unintended side effects. The script checks its own state before acting. The agent can safely retry without guessing the system state.

- Atomicity means a sequence of operations is wrapped in a single interpreter call. Intermediate states are not exposed to the agent. This keeps the context clean and reduces fragmentation.

- Observability means every script is a file under version control. Its history and logs form an auditable record. Debugging becomes a matter of reading the script and its output, not reconstructing ephemeral shell commands from memory.

- Together, these properties enable compound growth. Scripts improve with each use. Mistakes are fixed once and benefit all future calls. The script library becomes a growing cognitive asset.

## 4. Script Library Organization

- Scripts are stored in a two-level directory structure.

- Path pattern: `target / aspect / description.exp.<extension>`
  - The first level names the target entity or intent. Examples: `git`, `npm`, `file`, `process`.
  - The second level refines the direction or focus within that target. Examples: `git/commit`, `npm/network`, `file/find`.
  - The file name contains a brief description, the `.exp.` marker, and the interpreter extension. Example: `git/commit/auto-sign.exp.sh`.

- Why this structure matters.
  - The first level anchors the scope. It answers the question "for what or under what precondition." This avoids the ambiguity of top-level categories like `network` that cut across unrelated domains.
  - The second level provides enough granularity without overwhelming the agent. A flat list of hundreds of scripts is hard to search. Deep nesting is hard to navigate. Two levels balance both concerns.
  - The path itself is a prompt. When the agent sees `git/commit/auto-sign.exp.sh`, it understands the context without additional description.

- Two scopes of script libraries.
  - A global library for cross-project experience.
  - A local project library for project-specific automation.

## 5. Script Interpreter Tool Behavior

- The tool accepts a script path and optional arguments. It invokes the appropriate interpreter based on the file extension.
- Supported interpreters include `bash`, `pwsh`, `python`, `node`, `bun`, and others. The agent selects the interpreter by writing the correct extension.
- The tool returns the script's standard output and standard error, along with an exit code. The agent receives a bounded, predictable response.

- The interpreter tool does not provide a full programming environment. It is a controlled channel for extending the agent's operating system reach. The agent should prefer built-in language libraries over external dependencies. This constraint keeps scripts lightweight and auditable.

## 6. Relationship with Environment Abstraction

- A script runs in a specific execution context. The environment is identified by a string like `<user>@<host>[:path]`.
- The environment tells the agent where the script will execute. It may be a local machine, a container, or a remote host accessed via SSH.
- The environment address is injected into the agent's identity block once per session. It does not consume ongoing context window space.

- The combination of script path and environment address fully specifies an action. The script says what to do. The environment says where to do it.

## 7. Security and Applicability Boundaries

- Script execution carries higher risk than a single shell command. A script can contain arbitrary logic. Simple pattern matching cannot guarantee safety.

- Therefore, this design defines clear boundaries.
  - It is not suitable for public multi-tenant production environments. In such settings, constrained dedicated tools are the safer choice.
  - It is valuable for local development, personal workstations, and single-user auditable environments. The productivity gains and experience accumulation outweigh the security tradeoffs.

- Best practice for security.
  - Run the agent inside a container or virtual machine. Isolation at the environment level is more robust than filtering commands.
  - Review scripts before adding them to the shared library.

## 8. Compound Growth over Time

- Even the simplest command can become a script. The command `id` could be wrapped as `system/info/user-id.exp.sh`. Over time, the library accumulates small, tested, reliable fragments.

- The agent develops a self-aware identity through its own scripts. A script like `agent/identity/whoami.exp.sh` can output the agent's current environment, version, and capabilities. This becomes part of the agent's own operational vocabulary.

- The library grows with the project. Each solved problem leaves a trace that makes the next similar problem easier.

## 9. Conclusion

- Script as Native Extension replaces ephemeral shell commands with versioned, idempotent, and observable artifacts. It shifts the agent's interaction with the operating system from ad-hoc execution to compound accumulation of experience.

- The design is speculative and requires empirical validation. Its value proposition rests on three pillars: idempotency for safe retries, atomicity for clean context, and observability for debugging and growth.

- When combined with the Issue Tree for logical addressing and lazy tool evaluation for output management, the script library completes a minimal yet coherent instruction set for an LLM-powered agent interpreter.

---

> This document is a heuristic thought experiment and a sharing of technical ideas. It is not a finished paper or a proven result. The ideas here are still at the stage of early speculation. They have not been checked with real data or strict math proofs. The square root numbers are only guesses based on an analogy, not on experiments with language models. If you have thoughts, corrections, or ways to test these ideas with actual models, I would be very glad to hear from you. Please take this as an open invitation to discuss and improve the ideas together.
