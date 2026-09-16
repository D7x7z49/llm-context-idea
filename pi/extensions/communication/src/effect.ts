import type {
  ExtensionContext,
  ToolCallEventResult,
  ToolResultEvent,
  UserBashEventResult,
} from "@earendil-works/pi-coding-agent";
import { FAILURE_HINT } from "./constants.js";

// pi-good-communication: pi boundary for the communication guards.
//
// contract:
//   notify(ctx, message, type) -> posts the message only when a UI exists.
//   blockUserBash(message)     -> full replacement result, exitCode 1.
//   blockTool(reason)          -> blocking result for a tool call.
//   appendFailureHint(event)   -> append-only patch of a failed bash result.
//
// this module owns every pi side effect and every event result shape.

// --- Context contract ---

// the guard needs only the ui notification surface of the pi context.
export type NotificationContext = Pick<ExtensionContext, "hasUI"> & {
  readonly ui: Pick<ExtensionContext["ui"], "notify">;
};

// --- Effects ---

export function notify(
  ctx: NotificationContext,
  message: string,
  type: "info" | "warning" | "error",
): void {
  if (!ctx.hasUI) {
    return;
  }
  ctx.ui.notify(message, type);
}

export function blockUserBash(message: string): UserBashEventResult {
  return {
    result: {
      output: message,
      exitCode: 1,
      cancelled: true,
      truncated: false,
    },
  };
}

export function blockTool(reason: string): ToolCallEventResult {
  return { block: true, reason };
}

export function appendFailureHint(event: ToolResultEvent) {
  return {
    content: [...event.content, { type: "text" as const, text: FAILURE_HINT }],
  };
}
