<!-- experience/dev/error/error-handling-decision-framework.exp.md -->
<!-- How to choose the right time to catch, wrap, clean up, or propagate exceptions. -->

STEP.
- evaluate recovery, translation, cleanup, and user-boundary cases in order for every fallible operation
- catch and correct an error when the current function can recover safely and completely
- catch and wrap an error when it crosses a meaningful module or domain boundary and the wrapper adds useful context
- use `try/finally` or a context manager when cleanup must happen on both success and failure
- catch an expected domain error at the user interaction boundary when the application must report it and exit cleanly
- let the exception propagate when none of these conditions applies
- let low-level modules raise or re-raise exceptions without UI behavior
- translate an error only when the receiving layer uses a different vocabulary
- preserve the original cause with `raise ... from ...` when wrapping an exception
- fail fast when an invalid state could create corrupted, partial, or misleading results

NOTE.
- do not catch an exception only to rethrow it unchanged
- do not catch an exception only to replace it with a less specific message
- do not catch an exception before the layer that owns the recovery or reporting decision
- do not catch the same failure at multiple layers unless each layer makes a new decision or adds essential context
- avoid nested wrappers that repeat the same context and bury the root cause
- do not catch `Exception` broadly unless the boundary has a deliberate policy for unexpected failures
- keep reusable logic independent of user output and process termination
- report expected failures with concise and actionable feedback at the user boundary
- keep unexpected programming errors visible for debugging
- include the operation, relevant object, and safe corrective action in semantic error messages
- do not expose credentials, private data, or sensitive response content in error messages
- use `finally` or a context manager for files, locks, connections, and temporary resources
- do not silently discard a cleanup failure or the original failure; use explicit chaining or grouping when both matter
- do not return an empty success value, unrelated default, or partial result after a failed operation
- verify that error handling prevents silent failures, zombie states, and hidden data corruption

---
