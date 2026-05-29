// pi-good-communication: communication discipline for pi.
//
// three guards based on character count, enforcing the Shannon model:
//   SRC (Information Source) — user
//   DST (Destination) — agent
//
// all three use the same threshold:
//   [0, 160)     pass
//   [160, +inf)  block

import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { isBashToolResult } from "@earendil-works/pi-coding-agent";

const MAX_CHARS = 160;

function isBlocked(length: number): boolean {
  return length >= MAX_CHARS;
}

const MSG = {
  srcMsgBlock: (length: number) =>
    `src-msg: prompt blocked at ${length} chars (max ${MAX_CHARS}). write a doc or script.`,

  srcCmdBlockOutput: (length: number) =>
    `command blocked by src-cmd guard (${length} chars, max ${MAX_CHARS}).`,

  dstBashBlockReason: (length: number) =>
    `command too long (${length} chars, max ${MAX_CHARS}). ` +
    "write a standalone script to scripts/ or tmp/scripts/ instead. " +
    "this gives you idempotency, makes debugging easier, " +
    "and leaves an auditable record.",
};

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

export default function (pi: ExtensionAPI) {
  // --- src-msg: user prompt length guard ---

  pi.on("input", (event, ctx) => {
    if (!isBlocked(event.text.length)) return;
    ctx.ui.notify(MSG.srcMsgBlock(event.text.length), "error");
    return { action: "handled" };
  });

  // --- src-cmd: user shell command length guard ---

  pi.on("user_bash", (event, ctx) => {
    if (!isBlocked(event.command.length)) return;
    ctx.ui.notify(
      `src-cmd: command blocked at ${event.command.length} chars (max ${MAX_CHARS}).`,
      "error",
    );
    return blockResult(MSG.srcCmdBlockOutput(event.command.length));
  });

  // --- dst-bash: agent shell execution length guard ---

  pi.on("tool_call", (event, ctx) => {
    if (event.toolName !== "bash") return;
    const command = event.input.command as string;
    if (!command) return;

    if (!isBlocked(command.length)) return;

    ctx.ui.notify(
      `dst-bash: agent command blocked at ${command.length} chars (max ${MAX_CHARS}).`,
      "error",
    );
    return {
      block: true,
      reason: MSG.dstBashBlockReason(command.length),
    };
  });

  // --- dst-bash: failed execution afterthought ---

  pi.on("tool_result", (event) => {
    if (!isBashToolResult(event)) return;
    if (!event.isError) return;

    const hint =
      "this command failed. " +
      "consider extracting it into a standalone script " +
      "to scripts/ or tmp/scripts/ for debugging and re-runs?";

    return {
      content: [...event.content, { type: "text", text: `[pi-good-communication] ${hint}` }],
    };
  });
}
