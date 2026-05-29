// test/communication.unit.test.ts
// unit tests for pi-good-communication pure functions.

import { describe, it } from "node:test";

// --- mirrored from src/index.ts ---

const MAX_CHARS = 160;

function isBlocked(length: number): boolean {
  return length >= MAX_CHARS;
}

function blockResult(msg: string) {
  return {
    result: {
      output: msg,
      exitCode: 1,
      cancelled: true,
      truncated: false,
    },
  };
}

function appendFailureHint(
  content: Array<{ type: string; text?: string }>,
): Array<{ type: string; text?: string }> {
  const hint =
    "this command failed. " +
    "consider extracting it into a standalone script " +
    "to scripts/ or tmp/scripts/ for debugging and re-runs?";
  return [...content, { type: "text", text: `[pi-good-communication] ${hint}` }];
}

// --- helpers ---

function eq<T>(actual: T, expected: T, label?: string) {
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  if (a !== e) {
    throw new Error(`${label ?? "mismatch"}:\n  actual:   ${a}\n  expected: ${e}`);
  }
}

// --- tests ---

describe("isBlocked", () => {
  it("returns false below MAX_CHARS", () => {
    eq(isBlocked(0), false);
    eq(isBlocked(159), false);
  });

  it("returns true at and above MAX_CHARS", () => {
    eq(isBlocked(160), true);
    eq(isBlocked(500), true);
  });
});

describe("blockResult", () => {
  it("returns cancelled error result with exitCode 1", () => {
    const r = blockResult("blocked");
    eq(r.result.output, "blocked");
    eq(r.result.exitCode, 1);
    eq(r.result.cancelled, true);
  });
});

describe("appendFailureHint", () => {
  it("appends hint after existing content", () => {
    const original = [{ type: "text" as const, text: "error output" }];
    const result = appendFailureHint(original);

    eq(result[0], original[0]);
    eq(result.length, original.length + 1);
  });

  it("hint mentions script paths and ends with ?", () => {
    const result = appendFailureHint([]);
    const text = result[0]?.text ?? "";

    if (!text.includes("scripts/")) throw new Error("missing scripts/ path");
    if (!text.includes("tmp/scripts/")) throw new Error("missing tmp/scripts/ path");
    if (!text.endsWith("?")) throw new Error("hint should end with ? (interrogative)");
  });
});
