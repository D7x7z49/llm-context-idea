# Lazy Tool Evaluation: Deferred Output as Contextual Pipe

## 1. Problem Statement

- In ReAct and similar agent loops, every tool call writes both the call instruction and its full output into the conversation history.
- Tool outputs are often long and contain noise unrelated to the current reasoning goal. This bloats the context window and dilutes attention.
- When multiple tools are chained, intermediate results are written back repeatedly. Token usage grows with each step, even though most of the output is not needed later.
- Sensitive data such as API keys or internal configurations appear in plain text within the history. This is both a security concern and a waste of cognitive space.

## 2. Inspirations and Foundations

The design draws from three sources.

- Unix pipe philosophy: Commands pass data streams by reference. The receiver reads from the pipe without a full copy being stored at each stage.
- Algebraic homomorphism and quotient sets: A single symbol can stand for an entire equivalence class of values. This enables indirect addressing and deferred computation.
- Handles and references in computer science: A handle separates the identity of data from its content. The data is materialized only when needed.

## 3. Core Mechanism

- After a tool executes, the agent does not write the actual output into the history. Instead, it writes a lazy placeholder tag.
- A suggested tag format is `@lazy{{payload}}`. The payload describes the tool state and the location of the real output. It may be a string, a JSON structure, or even a dynamic hint.
- The system maintains a mapping table between each tag and its corresponding real output.
- In every turn, the context sent to the agent includes a semantic block that lists currently active lazy tags and a brief summary of their state.
- When the reasoning flow requires the actual content of a tag, the system expands it into the current step. After use, the expanded content may be kept or discarded.

## 4. Comparison with MCP and Skill

- MCP and Skill use direct invocation: each call requires a full structured request frame and a full response frame. There is no intermediate symbolic layer.
- Without a symbolic layer, there is no indirect addressing. Context becomes polluted with protocol metadata and complete outputs.
- The trend toward CLI tools over MCP and Skill reflects the power of pipes and redirection. The shell passes references, not copies.
- Lazy tool evaluation brings the same primitives into the cognitive loop of an agent. Tool chains shift from full materialization to reference passing.

## 5. Value and Boundaries

The approach offers several benefits.

- Context purity: A placeholder, especially a UUID with no semantic leakage, distracts the model far less than a full verbose output.
- Token economy: Writing a short tag instead of a long output saves tokens. This matters most when outputs are large and only a fraction is needed later.
- Sensitive data isolation: A tag like `@lazy{{github key for repo X}}` lets the agent know what is being used without exposing the secret itself.
- Multi-tool efficiency: When three or more tools are chained and intermediate output sizes threaten window health, lazy evaluation yields net token savings.

The approach also has boundaries.

- For a single tool call with small output, the overhead of managing a tag may exceed the cost of writing the output directly.
- The system must implement tag resolution and lifecycle management. This adds engineering complexity.
- Lazy evaluation is not a substitute for proper summarization. It is a complement for managing tool output flow.

## 6. Relationship with the Issue Tree

- The Issue Tree provides logical coordinates and epistemic types for messages.
- Lazy tool evaluation provides a reference mechanism for tool outputs.
- Together they form the memory management subsystem of an LLM-powered agent interpreter. The tree handles address space; lazy evaluation handles data swapping.

## 7. Conclusion

Lazy tool evaluation treats tool outputs as deferred references rather than immediate copies. By placing a symbolic pipe inside the context window, it reduces token waste, protects sensitive data, and keeps the agent focused on uncertainty reduction rather than noise. The design is speculative and awaits empirical testing, but its foundations in Unix philosophy and algebraic abstraction offer a coherent direction for improving long-lived agent projects.

---

> This document is a heuristic thought experiment and a sharing of technical ideas. It is not a finished paper or a proven result. The ideas here are still at the stage of early speculation. They have not been checked with real data or strict math proofs. The square root numbers are only guesses based on an analogy, not on experiments with language models. If you have thoughts, corrections, or ways to test these ideas with actual models, I would be very glad to hear from you. Please take this as an open invitation to discuss and improve the ideas together.
