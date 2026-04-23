# llm-context-idea
Research notes on maintaining and reasoning about LLM context windows across long-lived projects. Speculative ideas, heuristic boundaries, and design sketches without empirical validation.

## A View of LLM-powered Agents as Interpreters

A bare LLM API is a prediction engine, not an interpreter. An interpreter emerges when that engine is wrapped in a loop that maintains state, routes tool calls, and manages memory across turns. This is the structure of an LLM-powered agent.

In this view, the agent becomes a virtual machine that executes a stream of natural language and structured signals. The context window serves as its working memory, tools act as I/O ports, and the conversation history forms an addressable call stack.

The ideas collected in this repository explore what a minimal instruction set for such an interpreter might look like. Instead of ad-hoc prompt engineering, we ask: what lightweight syntax for context addressing, state tagging, and lazy evaluation would make these agents more reliable across long-lived projects?

## Core Ideas

### The Forgetful Society: Memory Limits and Collective Progress

What can a society achieve when every individual forgets almost everything after just a few actions? This thought experiment explores the necessary conditions for progress under extreme memory constraints. It draws on Amdahl's Law, Brooks's Law, information theory, and automata theory to argue that externalization, atomic decomposition, and environmental prompting are essential. Cooperation becomes crucial when individual capacity is smallest, but its benefits diminish and eventually turn negative as coordination overhead grows. The analogy maps directly to LLM agents: the context window is the forgetful memory, and persistent structures like the Issue Tree are the external notes that make long-lived projects possible.

See [idea/forgetful-society.md](idea/forgetful-society.md) for the full reasoning, formal definitions, and implications for agent design.

### Issue Tree: Paths and Epistemic Nodes

The Issue Tree provides an addressable, typed structure for agent conversation history. Each message is assigned a path like `/number/...` that encodes its position in the branching history of the dialogue. Four node types—Task, Question, Condition, and None—classify messages based on the sender's knowledge state and presupposition about the receiver. Combined with state rules (active, blocked, failed, completed), the tree serves as a call stack for the agent interpreter, enabling precise recall of reasoning chains across long project lifespans.

See [idea/issue-tree.md](idea/issue-tree.md) for the full specification, including the derivation of node types from information theory and the path addressing scheme.

### Context Compression and Redundancy Boundaries

A recurring challenge in long-lived agent projects is knowing when context compression has removed essential information or when a conversation has become unnecessarily verbose. The square root boundary offers a heuristic for both concerns.

Given an original context of N tokens and a compressed representation of k tokens, the inequality k ≤ √N signals that irreversible semantic loss has likely occurred. This does not guarantee lossless compression when k exceeds √N, but it provides a hard floor below which damage is certain. The same logic applies to task execution: if solving a problem consumes N_context tokens but the core answer could be expressed in k_task tokens, then N_context > k_task² suggests structural redundancy. The agent is spending more tokens than the minimal abstraction leap would require.

These indicators are model-agnostic and can be computed on the fly. They offer an early warning system for context health, enabling agents to request more detail, reduce compression aggressiveness, or trigger summarization when boundaries are crossed.

See [idea/square-root-boundary.md](idea/square-root-boundary.md) for the full derivation, assumptions, and limitations of this heuristic thought experiment.

### Lazy Tool Evaluation: Deferred Output as Contextual Pipe

When tools are called in an agent loop, their outputs are usually written directly into the conversation history. For large outputs or chained tool calls, this pollutes the context window with noise and wastes tokens. Lazy tool evaluation replaces the actual output with a placeholder tag such as `@lazy{{payload}}`. The system maintains the mapping and expands the output only when needed. This keeps the context focused and protects sensitive data, much like a Unix pipe passes references instead of materializing data at every step.

See [idea/lazy-tool-evaluation.md](idea/lazy-tool-evaluation.md) for the mechanism, inspirations, and a comparison with MCP and Skill approaches.

### Script as Native Extension: From Shell Commands to Reusable Artifacts

Agents often rely on a generic shell tool for command execution, which leads to brittle pipelines, poor debuggability, and no accumulation of experience. This idea replaces ad-hoc shell commands with versioned script files stored in a two-level library organized by target and aspect. The script interpreter tool runs these artifacts, enabling idempotency, atomicity, and observability. Over time, the script library becomes a growing cognitive asset that strengthens the agent's operational vocabulary.

See [idea/script-as-tool.md](idea/script-as-tool.md) for the full design, including the path convention, environment abstraction, and security boundaries.

### Temporal Clustering: Giving Agents a Sense of Time

Agents treat conversation history as a flat sequence and lack any sense of time. This algorithm uses only timestamps to detect natural clusters of messages that were created close together. By tracking the relative existence weights of information pieces, it identifies when a long pause signals a likely shift in the user's thinking. The normalized variance of these weights provides a single number that indicates whether attention is evenly spread or stuck in the distant past. The method helps agents decide when to forget, when to bias retrieval toward recent clusters, and when to be cautious about linking new messages with stale history.

See [idea/temporal-clustering.md](idea/temporal-clustering.md) for the full algorithm, formulas, and applications.

## A Note on Human Distinction: Recording and Retrieval

What sets humans apart from other animals is not language or tools alone. Some animals communicate with complex signals. Some use and even shape objects as tools. The difference lies deeper.

An animal that invents a better way to crack a nut may pass the skill to its young by showing them. But if that animal dies before teaching, the skill dies with it. The group must invent it again from nothing. There is no storage outside the living brain. A rare individual success remains a one-time event. It does not become a trait of the group.

Humans store knowledge outside themselves. Marks on bone, clay, paper, or silicon keep information stable across time. A person can retrieve what someone else recorded long ago, even if they never met. This turns a single discovery into a shared capacity. An invention made once can be copied by many. A genius born once can teach generations never born.

This mechanism changes the path of development. Major leaps in human technology follow major changes in how knowledge is stored and retrieved. Stone and clay let early cities track goods and laws. Paper and ink spread ideas across continents. The printing press made books cheap and common. Magnetic tape and hard disks let machines read and write on their own. Each jump in storage capacity or speed came before a burst of new tools and methods. The ability to record and retrieve at scale turns rare insight into common practice. Without it, progress remains local and temporary.
