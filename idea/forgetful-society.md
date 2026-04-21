# The Forgetful Society: A Thought Experiment on Memory Limits and Collective Progress

## 1. Inspirations and Origins

This thought experiment draws from several sources.

- Amdahl's Law: The speedup of a system is limited by the part that cannot be parallelized. Here, the individual memory limit acts as the serial bottleneck.
- Brooks's Law: Adding people to a late project makes it later. Coordination overhead grows faster than added capacity.
- Information theory: Communication between individuals relies on an external channel. The bandwidth and reliability of this channel shape what cooperation can achieve.
- Turing machines and automata theory: The memory capacity of an individual determines its computational class. Cooperation can lift this ceiling.

## 2. Premises and Definitions

- There is a society with n individuals. Each individual i has a memory of exactly k slots, where k is between 3 and 5.
- An individual can perform atomic actions: read a note, write a note, execute an operation, or wait.
- Notes are persistent external storage. Reading or writing a note consumes one memory slot.
- After performing k actions, the individual's memory is completely erased.
- Development means the society accumulates knowledge and handles tasks of increasing complexity.
- Progress means sustained improvement in the society's ability to solve problems and produce goods.

## 3. Necessary Conditions for Progress

Three conditions must hold for the society to make progress.

- Externalization. Information must be stored in notes. If all knowledge stays only in individual memory, it vanishes after k actions. No task longer than k steps can ever be finished.
- Atomic decomposition. Every complex task must be broken into subtasks. Each subtask must require at most k memory slots to execute. Otherwise, an individual forgets critical information mid-step.
- Environmental prompting. After a memory reset, the individual needs a cue for what to do next. Notes placed in fixed locations or simple signals provide this cue without consuming memory for the plan itself.

Formally, if progress is possible, then externalization, atomic decomposition, and environmental prompting must all be present.

## 4. Sufficient Conditions and Computational Power

The minimal memory k determines what an individual can compute alone.

- For k equal to 1 or 2, an individual is a finite automaton. It can only handle regular languages.
- For k at least 3, a single individual with notes can simulate a Turing machine. The three slots hold the current state, the current symbol read from a note, and a temporary value. This is enough for universal computation.

Therefore, for k greater than or equal to 3, the three necessary conditions are also sufficient. A single individual can perform any computable task given enough notes and time.

- For k equal to 2, a single individual cannot perform non-regular tasks. Two individuals must cooperate. Each uses two memory slots to simulate one register of a two-register machine. Together they become Turing complete. Cooperation becomes an additional necessary condition when k equals 2.

## 5. The Role and Limits of Cooperation

Cooperation always helps, but its benefit shrinks as individual memory grows.

- For a fixed k, adding more individuals improves the society's capacity. However, the gain per additional individual decreases.
- There is a threshold number of individuals beyond which coordination overhead outweighs the added benefit. Communication requires reading and writing shared notes, which consumes memory slots. Too many collaborators create congestion.
- This matches Brooks's Law: adding more agents increases the communication links quadratically. After some point, the system slows down.

Cooperation is most valuable when individual memory is smallest. As k increases, the need for tight coordination fades.

## 6. Mapping to LLM Agent Design

The forgetful society mirrors the constraints of LLM-powered agents.

- Individual memory k corresponds to the context window size in tokens.
- Notes correspond to persistent storage: the Issue Tree nodes, lazy tool placeholders, and script library files.
- Environmental prompting corresponds to path strings and node type tags. The agent reads the next step from the Issue Tree path rather than remembering it.
- Atomic decomposition corresponds to idempotent scripts and lazy tool evaluation. Each tool call fits within the window and leaves a clean external record.
- Cooperation corresponds to multiple agents sharing the same Issue Tree and note system.

The society's path to progress is also the agent's path: externalize knowledge, decompose tasks, and use explicit cues.

## 7. Conclusion

A society of forgetful individuals can develop and progress. It must build an external memory of notes, break work into small atomic pieces, and rely on environmental prompts. When individual memory is as small as two slots, cooperation becomes essential. Even then, more cooperation is not always better.

The same principles apply to LLM agents operating within tight context windows. Externalization, atomicity, and explicit cues are the foundation for long-lived project work.

---

> This document is a heuristic thought experiment and a sharing of ideas. It is not a finished paper or a proven result. The reasoning is speculative and awaits further discussion and empirical grounding.
