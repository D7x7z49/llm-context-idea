// test/wal.unit.test.ts
// unit tests for buildWalSteps with mock session data.

import { describe, it } from "node:test";

interface MockEntry {
  type: string;
  timestamp?: string;
  message?: {
    role: string;
    content?: Array<{ type: string; text?: string }>;
    command?: string;
    excludeFromContext?: boolean;
  };
}

interface Step {
  kind: "text" | "bash";
  text: string;
  timestamp: number;
}

// inline buildWalSteps — mirrors src/index.ts
function buildWalSteps(ctx: { sessionManager: { getBranch(): MockEntry[] } }): string[] {
  const steps: Step[] = [];
  const entries = ctx.sessionManager.getBranch();

  for (const entry of entries) {
    if (entry.type !== "message" || !entry.message) continue;
    const msg = entry.message;
    const ts = entry.timestamp ? Date.parse(entry.timestamp) : 0;

    if (msg.role === "user" && msg.content) {
      for (const block of msg.content) {
        if (block.type === "text" && block.text) {
          const text = block.text.trim();
          if (text) steps.push({ kind: "text", text, timestamp: ts });
        }
      }
      continue;
    }

    if (msg.role === "bashExecution" && msg.command && !msg.excludeFromContext) {
      steps.push({ kind: "bash", text: msg.command, timestamp: ts });
    }
  }

  steps.sort((a, b) => a.timestamp - b.timestamp);

  return steps.map((s) => (s.kind === "bash" ? `- ! ${s.text}` : `- ${s.text}`));
}

function userMsg(iso: string, text: string): MockEntry {
  return {
    type: "message",
    timestamp: iso,
    message: { role: "user", content: [{ type: "text", text }] },
  };
}

function bashMsg(iso: string, command: string, excludeFromContext?: boolean): MockEntry {
  return {
    type: "message",
    timestamp: iso,
    message: { role: "bashExecution", command, excludeFromContext },
  };
}

function ctx(entries: MockEntry[]) {
  return { sessionManager: { getBranch: () => entries } };
}

function eq(actual: string[], expected: string[]) {
  const ok = actual.length === expected.length && actual.every((v, i) => v === expected[i]);
  if (!ok) {
    throw new Error(
      `mismatch:\n  actual:   ${JSON.stringify(actual)}\n  expected: ${JSON.stringify(expected)}`,
    );
  }
}

describe("buildWalSteps", () => {
  it("extracts user text messages", () => {
    eq(
      buildWalSteps(
        ctx([
          userMsg("2026-01-01T00:00:01Z", "hello"),
          userMsg("2026-01-01T00:00:02Z", "read README"),
        ]),
      ),
      ["- hello", "- read README"],
    );
  });

  it("extracts bashExecution commands as shell steps", () => {
    eq(
      buildWalSteps(
        ctx([
          bashMsg("2026-01-01T00:00:01Z", "git status"),
          bashMsg("2026-01-01T00:00:02Z", "ls -la"),
        ]),
      ),
      ["- ! git status", "- ! ls -la"],
    );
  });

  it("merges user text and bash chronologically", () => {
    eq(
      buildWalSteps(
        ctx([
          bashMsg("2026-01-01T00:00:01Z", "ls"),
          userMsg("2026-01-01T00:00:02Z", "hi"),
          userMsg("2026-01-01T00:00:03Z", "who are you?"),
          bashMsg("2026-01-01T00:00:04Z", "echo hello"),
        ]),
      ),
      ["- ! ls", "- hi", "- who are you?", "- ! echo hello"],
    );
  });

  it("skips !! commands", () => {
    eq(
      buildWalSteps(
        ctx([
          bashMsg("2026-01-01T00:00:01Z", "secret", true),
          bashMsg("2026-01-01T00:00:02Z", "visible"),
        ]),
      ),
      ["- ! visible"],
    );
  });

  it("handles empty session", () => {
    eq(buildWalSteps(ctx([])), []);
  });
});
