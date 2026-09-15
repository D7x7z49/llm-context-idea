// test/communication.unit.test.ts
// unit tests for pi-good-communication pure functions.

import { strictEqual } from "node:assert/strict";
import { describe, it } from "node:test";
import type { ToolResultEvent } from "@earendil-works/pi-coding-agent";
import { FAILURE_HINT, MESSAGES, THRESHOLDS } from "../src/constants.js";
import { appendFailureHint, blockTool, blockUserBash, notify } from "../src/effect.js";
import { EXEMPTION_SETS } from "../src/ranges.js";
import { decideUnits, lookupExemptionSet, measureUnits } from "../src/service.js";

// --- helpers ---

function codePointsAround(start: number, end: number): number[] {
  return [start - 1, start, end, end + 1].filter((code) => code >= 0 && code <= 0x10ffff);
}

// the regex is test oracle only; production code holds no regex.
function isInScript(id: string, code: number): boolean {
  const name = id[0].toUpperCase() + id.slice(1);
  return new RegExp(`\\p{Script=${name}}`, "u").test(String.fromCodePoint(code));
}

// --- lookup ---

describe("lookupExemptionSet", () => {
  it("matches the runtime script property on every range boundary", () => {
    // a code point just outside a range may still be exempt through another set,
    // so the check compares set membership, not undefined.
    let checked = 0;
    for (const set of EXEMPTION_SETS) {
      for (const [start, end] of set.ranges) {
        for (const code of codePointsAround(start, end)) {
          strictEqual(
            lookupExemptionSet(code) === set.id,
            isInScript(set.id, code),
            `${set.id} U+${code.toString(16)}`,
          );
          checked += 1;
        }
      }
    }
    const expected = EXEMPTION_SETS.reduce((total, set) => total + set.ranges.length * 4, 0);
    strictEqual(checked, expected);
  });

  it("returns undefined outside every set", () => {
    strictEqual(lookupExemptionSet(0x40), undefined);
    strictEqual(lookupExemptionSet(0x4e2d), undefined);
    strictEqual(lookupExemptionSet(0x1f600), undefined);
  });

  it("keeps each set sorted and non-overlapping", () => {
    for (const set of EXEMPTION_SETS) {
      for (let index = 1; index < set.ranges.length; index += 1) {
        strictEqual(set.ranges[index - 1][1] < set.ranges[index][0], true, `${set.id} ${index}`);
      }
    }
  });
});

// --- measurement ---

describe("measureUnits", () => {
  it("counts an empty string as zero", () => {
    strictEqual(measureUnits("").units, 0);
  });

  it("counts a latin run once, however long", () => {
    strictEqual(measureUnits("hello").units, 1);
    strictEqual(measureUnits("a".repeat(10000)).units, 1);
  });

  it("counts separators between latin runs", () => {
    strictEqual(measureUnits("hello world").units, 3);
    strictEqual(measureUnits("hello, world").units, 4);
  });

  it("counts code points outside the exemption sets one by one", () => {
    strictEqual(measureUnits("你好").units, 2);
    strictEqual(measureUnits("2024-09-15").units, 10);
  });

  it("counts one unit per exempt script run", () => {
    strictEqual(measureUnits("γειά σου").units, 3);
    strictEqual(measureUnits("안녕하세요").units, 1);
    strictEqual(measureUnits("नमस्ते दुनिया").units, 3);
    strictEqual(measureUnits("مرحبا بالعالم").units, 3);
  });

  it("charges one unit when the exempt script changes", () => {
    strictEqual(measureUnits("abcдеф").units, 2);
  });

  it("counts mixed han and latin text", () => {
    strictEqual(measureUnits("中文混合 attention focus").units, 8);
  });

  it("treats a combining mark as its own unit for now", () => {
    strictEqual(measureUnits("e\u0301").units, 2);
  });
});

// --- decision ---

describe("decideUnits", () => {
  it("passes below the threshold", () => {
    strictEqual(decideUnits({ units: 159 }, 160).action, "pass");
  });

  it("blocks at and above the threshold", () => {
    strictEqual(decideUnits({ units: 160 }, 160).action, "block");
    strictEqual(decideUnits({ units: 500 }, 160).action, "block");
  });

  it("keeps the measurement in the decision", () => {
    const measurement = { units: 3 };
    strictEqual(decideUnits(measurement, 80).measurement, measurement);
  });
});

// --- effects ---

describe("notify", () => {
  it("posts a message when a UI is present", () => {
    const calls: { message: string; type: string }[] = [];
    const ctx = {
      // biome-ignore lint/style/useNamingConvention: mirrors the pi context field.
      hasUI: true,
      ui: {
        notify(message: string, type?: "info" | "warning" | "error") {
          calls.push({ message, type: type ?? "info" });
        },
      },
    };

    notify(ctx, "hello", "error");

    strictEqual(calls.length, 1);
    strictEqual(calls[0].message, "hello");
    strictEqual(calls[0].type, "error");
  });

  it("stays silent without a UI", () => {
    let called = false;
    const ctx = {
      // biome-ignore lint/style/useNamingConvention: mirrors the pi context field.
      hasUI: false,
      ui: {
        notify() {
          called = true;
        },
      },
    };

    notify(ctx, "hello", "error");

    strictEqual(called, false);
  });
});

describe("block results", () => {
  it("returns a cancelled user bash result with exit code 1", () => {
    const result = blockUserBash("blocked");

    strictEqual(result.result?.output, "blocked");
    strictEqual(result.result?.exitCode, 1);
    strictEqual(result.result?.cancelled, true);
  });

  it("returns a blocking tool call result", () => {
    const result = blockTool("too complex");

    strictEqual(result.block, true);
    strictEqual(result.reason, "too complex");
  });
});

describe("appendFailureHint", () => {
  it("appends the hint after existing content", () => {
    const event: ToolResultEvent = {
      type: "tool_result",
      toolCallId: "call-1",
      toolName: "bash",
      input: { command: "false" },
      content: [{ type: "text", text: "error output" }],
      details: undefined,
      isError: true,
    };

    const patch = appendFailureHint(event);

    strictEqual(patch.content.length, 2);
    strictEqual(patch.content[0], event.content[0]);
    const appended = patch.content[1];
    strictEqual(appended.type, "text");
    strictEqual(appended.text, FAILURE_HINT);
  });
});

// --- messages ---

describe("messages", () => {
  it("reports the measured units and the limit", () => {
    const message = MESSAGES.srcMsgBlock(170);

    strictEqual(message.includes("170"), true);
    strictEqual(message.includes(String(THRESHOLDS.prose)), true);
  });

  it("keeps the failure hint actionable", () => {
    strictEqual(FAILURE_HINT.includes("scripts/"), true);
    strictEqual(FAILURE_HINT.endsWith("?"), true);
  });
});
