import {
  type ExtensionAPI,
  isBashToolResult,
  isToolCallEventType,
} from "@earendil-works/pi-coding-agent";
import { MESSAGES, THRESHOLDS } from "./constants.js";
import { appendFailureHint, blockTool, blockUserBash, notify } from "./effect.js";
import { decideUnits, measureUnits } from "./service.js";

// pi-good-communication: keep the agent channel focused.
//
// contract:
//   input       -> human prose; passes below THRESHOLDS.prose.
//   user_bash   -> human shell command; passes below THRESHOLDS.shell.
//   tool_call   -> agent bash command; passes below THRESHOLDS.shell.
//   tool_result -> a failed bash command gets a script hint.
//
// this module only wires pi events to the measurement service and to the
// effects. it holds no rules of its own.

export default function (pi: ExtensionAPI) {
  // --- Human message input ---

  pi.on("input", (event, ctx) => {
    if (event.source === "extension") {
      return { action: "continue" };
    }

    const measurement = measureUnits(event.text);
    if (decideUnits(measurement, THRESHOLDS.prose).action === "pass") {
      return { action: "continue" };
    }

    notify(ctx, MESSAGES.srcMsgBlock(measurement.units), "error");
    return { action: "handled" };
  });

  // --- Human shell input ---

  pi.on("user_bash", (event, ctx) => {
    const measurement = measureUnits(event.command);
    if (decideUnits(measurement, THRESHOLDS.shell).action === "pass") {
      return;
    }

    notify(ctx, MESSAGES.srcCmdNotice(measurement.units), "error");
    return blockUserBash(MESSAGES.srcCmdResult(measurement.units));
  });

  // --- Agent shell input ---

  pi.on("tool_call", (event, ctx) => {
    if (!isToolCallEventType("bash", event)) {
      return;
    }

    const command = event.input.command;
    if (!command) {
      return;
    }

    const measurement = measureUnits(command);
    if (decideUnits(measurement, THRESHOLDS.shell).action === "pass") {
      return;
    }

    notify(ctx, MESSAGES.dstBashNotice(measurement.units), "error");
    return blockTool(MESSAGES.dstBashReason(measurement.units));
  });

  // --- Failed command hint ---

  pi.on("tool_result", (event) => {
    if (!isBashToolResult(event) || !event.isError) {
      return;
    }

    return appendFailureHint(event);
  });
}
