# Temporal Clustering via Relative Existence: Giving Agents a Sense of Time

## 1. Why Agents Need Time Awareness

LLM-powered agents process conversations and project histories as sequences of messages. They rely on semantic similarity or fixed window sizes to decide what to remember. But they lack a basic sense of time. They cannot tell when a topic naturally ended, when a long pause signals a change in thinking, or when attention has drifted too far into the distant past.

This document describes a lightweight algorithm that uses only timestamps to detect natural time clusters and measure when attention becomes unbalanced. It gives agents a simple but useful sense of time.

## 2. Problem Statement

In long-lived projects or conversations, information arrives in bursts. Messages written close together are more likely to be related. Long gaps often mean a shift in focus. Without time awareness, an agent may:

- Force connections between new messages and stale history.
- Retrieve irrelevant context from a different time period.
- Miss the right moment to forget or archive old information.

Existing approaches either ignore time or use fixed decay functions. They do not adapt to the actual rhythm of the conversation.

## 3. Definitions

Let there be $n$ pieces of information, each with a creation timestamp. For example, these could be messages, notes, or tool call records.

- $t_i$: creation time of piece $i$, with $t_1 \le t_2 \le \dots \le t_n$.
- $T$: current observation time, $T \ge t_n$.

From these we compute values that depend on $T$.

- **Existence duration**: $d_i(T) = T - t_i$
- **Total existence**: $D(T) = \sum_{i=1}^n d_i(T) = nT - \sum_{i=1}^n t_i$
- **Relative existence weight**: $w_i(T) = \frac{d_i(T)}{D(T)}$

The weights are positive and sum to one. They measure how much of the total existence belongs to each piece. Older pieces have larger weights because they have existed longer relative to the whole.

- **Average creation time**: $\bar{t} = \frac{1}{n} \sum_{i=1}^n t_i$
- **Weight rate of change**: $\frac{dw_i}{dT} = \frac{n(t_i - \bar{t})}{D^2}$

The sign of the rate tells us whether a weight is growing or shrinking.

## 4. How Clusters Emerge from Relative Differences

The weight change rate depends on the sign of $t_i - \bar{t}$.

- Pieces older than average ($t_i < \bar{t}$) have positive rates. Their weights **increase** over time, and they move closer to each other in weight space.
- Pieces newer than average ($t_i > \bar{t}$) have negative rates. Their weights **decrease** over time, and they also move closer to each other.

Pieces created near each other in time will have similar rates. They form clusters that stay together as $T$ advances. Gaps in creation times create separation between clusters.

When a new piece arrives, $\bar{t}$ shifts rightward. Some older pieces may cross from the decreasing side to the increasing side. The cluster boundaries adjust automatically to the changing information density.

## 5. Detecting Segments and Attention Imbalance

We need a single number that tells us whether the weights are spread evenly or concentrated in a few old pieces. This number is the normalized variance of the weights.

The uniform distribution has $w_i = 1/n$ for all $i$. The variance of the weights is:

$$
\text{Var}(w) = \frac{1}{n} \sum_{i=1}^n \left( w_i - \frac{1}{n} \right)^2
$$

The maximum possible variance occurs when one piece has weight $1$ and all others have $0$. That maximum is $\frac{n-1}{n^2}$.

We define the **normalized variance** $C_{\text{norm}}$ as the ratio of actual to maximum variance:

$$
C_{\text{norm}} = \frac{\text{Var}(w)}{\text{Var}_{\max}} = \frac{n}{n-1} \sum_{i=1}^n \left( w_i - \frac{1}{n} \right)^2
$$

This value always lies between $0$ and $1$.

- $C_{\text{norm}} \approx 0$: weights are nearly uniform. Time distribution is smooth. No strong clustering or attention imbalance.
- $C_{\text{norm}} \approx 1$: a few very old pieces dominate the weights. A deep time gap separates them from newer pieces. Attention is stuck in the distant past.

A **sudden jump** in $C_{\text{norm}}$ after a long pause signals a large time gap between the new message and the existing history. This can mean the user's thinking may have shifted. The agent should be cautious about linking the new message tightly with the old cluster.

## 6. What Agents Can Do with This

The algorithm offers several practical signals.

**Natural segmentation.** Without any semantic analysis, the agent can detect where time gaps naturally split the history. Messages within the same weight cluster form a temporal context block.

**Retrieval with time bias.** When recalling related information, the agent can prefer pieces from the same time cluster as the current focus. This reduces noise from distant periods.

**Forgetting guidance.** When $C_{\text{norm}}$ stays above a threshold (for example, $0.7$), the agent's attention is overly concentrated on old pieces. It may be a good moment to summarize or archive the oldest cluster and free context space.

**Topic shift awareness.** If a user returns after hours or days, $C_{\text{norm}}$ jumps sharply. The agent can lower its reliance on the old cluster and ask whether to continue the previous topic or start fresh.

**Long-lived project maintenance.** By tracking cluster boundaries, the agent can label phases of a project (design, implementation, testing) and retrieve phase-appropriate context when needed.

## 7. Integration with Other Ideas in This Repository

This time-clustering view works alongside the other ideas collected here.

- **Issue Tree**: each node has a creation time. Adding a cluster label to nodes helps decide which branches are still active and which are ready for archival.
- **Square Root Boundary**: that boundary warns about space limits. This algorithm warns about time imbalance. Together they give a fuller picture of context health.
- **Forgetful Society**: the thought experiment emphasizes external notes and environmental prompts. Time clusters suggest how notes might be grouped or reordered over time.

## 8. Limitations

This algorithm uses only timestamps. It does not look at content. Two messages created in the same minute may be unrelated. Two messages created weeks apart may be deeply connected. The time clusters are only hints, not guarantees.

The linear existence assumption treats all information as equally durable. In practice, some old information (like expired credentials) should be forgotten regardless of its weight. The algorithm must be combined with other signals, such as explicit node types or user actions, to handle those cases.

The $C_{\text{norm}}$ value depends on the total number of pieces $n$. With very large $n$, even a skewed distribution may produce a small $C_{\text{norm}}$. A sliding window or dynamic threshold may be needed in long-running systems.

## 9. Conclusion

Temporal clustering via relative existence gives agents a lightweight sense of time. By watching how weights shift and when $C_{\text{norm}}$ spikes, an agent can detect natural segments, decide when to forget, and avoid forcing connections across long pauses. The method asks very little—only timestamps—and returns a clear signal about the rhythm of a conversation or project.

---

> This document is a heuristic thought experiment and a sharing of technical ideas. It is not a finished paper or a proven result. The ideas here are still at the stage of early speculation. They have not been checked with real data or strict math proofs. If you have thoughts, corrections, or ways to test these ideas with actual models, I would be very glad to hear from you. Please take this as an open invitation to discuss and improve the ideas together.
