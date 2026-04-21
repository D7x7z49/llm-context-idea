# Issue Tree: Path-Based Context Addressing with Epistemic Node Types

## 1. Premises and Inspirations

- The core purpose of every LLM API call in a project context is to reduce uncertainty.
- Information theory models communication as uncertainty reduction between exactly two parties: a sender and a receiver. Any multi-party exchange can be decomposed into multiple two-party channels.
- The TCP three-way handshake shows how state synchronization emerges from atomic exchanges. This project treats each message as a handshake attempt.
- In multi-agent setups, each agent is amnesic: its memory lives only in the context window. Coordination overhead grows faster than problem-solving capacity. This mirrors Brooks's Law in *The Mythical Man-Month*. Adding more agents often decreases efficiency because context space fills with coordination noise.
- The Issue Tree is inspired by the Git commit tree. Git tracks states of code; the Issue Tree tracks states of thought. Together they form a dual map of a project's evolution.

## 2. Epistemic Node Types

Every message is sent under two assessments made by the sender:

- The sender's own knowledge state regarding a proposition: Known or Unknown.
- The sender's presupposition about the receiver's knowledge state: Assumed Known or Assumed Unknown.

The cross product of these two binary dimensions yields four logical cases. Three cases correspond to distinct intents of uncertainty reduction. The fourth case is the complement of their union: it represents all situations where the epistemic intent cannot be determined.

- **Task**
  - Sender state: Known.
  - Presupposed receiver state: Assumed Known.
  - Meaning: The message conveys information already held by both parties according to the sender's assumption. It serves as a synchronization anchor.

- **Question**
  - Sender state: Unknown.
  - Presupposed receiver state: Assumed Known.
  - Meaning: The sender requests information, believing the receiver may possess it. The actual receiver state may differ.

- **Condition**
  - Sender state: Known.
  - Presupposed receiver state: Assumed Unknown.
  - Meaning: The sender offers new information or constraints, believing the receiver does not yet possess it. The actual receiver state may differ.

- **None**
  - Definition: Let U be the universe of all possible message intents. Let T, Q, and C be the sets of messages with Task, Question, and Condition intent respectively. Then:
    - None = U minus the union of T, Q, and C.
  - Meaning: The message belongs to none of the three definite epistemic categories. This includes:
      - Noise and irrelevant content.
      - Messages whose sender knowledge state or presupposition is itself unknown.
      - Any communication that does not fit the sender-receiver uncertainty reduction model.

A message of type None carries no computable uncertainty reduction intent. It is not necessarily useless, but it lies outside the logical framework of two-party epistemic exchange.

## 3. Node States and Tree Rules

Each node has one of four states: **active**, **blocked**, **failed**, or **completed**.

The tree obeys structural rules similar to the invariants of a red-black tree:

- The root node must be of type Task or Question.
- Leaf nodes may be of any type. However, a node of type None cannot have children.
- If any node or any of its descendants is active, then its parent must be in the blocked state.
- These rules encode dependency propagation: a blocked parent waits for resolution of active children.

## 4. Path Addressing

Every node has a unique path string of the form `/number/number/...`. The numbers are zero-based indices among siblings, assigned in chronological order.

- The root path is always `/`.
- The first child of the root is `/0`. The second child of the root is `/1`.
- A child of `/0` is `/0/0`. A sibling created later or via a retry branch is `/0/1`.

Given the path of the last message in a message list, the entire branching history and temporal order of the conversation can be reconstructed. Path strings serve as primary keys for storage and retrieval.

Example of path evolution with branching:

```
/                     (root message)
/0                    (first reply)
/0/0                  (follow-up to /0)
/0/1                  (retry or alternative branch from /0)
/1                    (branch from an earlier message, index 1)
/1/0                  (reply under that branch)
```

## 5. Issue Tree as a Project Memory Map

- The Issue Tree is an abstract mapping of the project's development thought process. It tracks why and when decisions were made.
- Each node can record the tools invoked, files read or written, and the state of the working directory at that moment.
- By following a path from root to leaf, an agent can recall the exact reasoning chain that led to the current state.
- The Issue Tree works alongside the Git commit tree. Git tracks code states; the Issue Tree tracks cognitive states. The mapping is from Issue Tree to file system changes, not the reverse. Every significant change must be recorded as an Issue node.
- When a bug occurs, the corresponding functional module can be mapped back to the Issue node where it was introduced. The path then allows tracing all subsequent decisions that affected that module.

## 6. Conclusion

The Issue Tree provides an addressable, typed, and rule-governed structure for agent conversation history. It serves as the call stack for an LLM-powered agent interpreter, enabling reliable long-term project maintenance within a finite context window.

---

> This document is a heuristic thought experiment and a sharing of technical ideas. It is not a finished paper or a proven result. The ideas here are still at the stage of early speculation. They have not been checked with real data or strict math proofs. The square root numbers are only guesses based on an analogy, not on experiments with language models. If you have thoughts, corrections, or ways to test these ideas with actual models, I would be very glad to hear from you. Please take this as an open invitation to discuss and improve the ideas together.
