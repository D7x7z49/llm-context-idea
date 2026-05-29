// pi-wal: WAL workflow extension for pi
// saves pi sessions as replayable .wal files.
//
// captures only the initiating side of agent communication:
//   user text prompt  -> "- <text>"
//   user !command     -> "- ! <command>"
//
// this is a simplified subset of WAL as defined in @SYNTAX.ebnf.
// two statement types, no indentation, no imports, no variables.
// represents the fundamental message-list abstraction of agent interaction.

import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { writeFileSync, mkdirSync } from "node:fs";
import { resolve, basename, extname, dirname, join } from "node:path";

const WAL_HEADER = [
  `# WAL — simplified subset of Workflow As List`,
  `# syntax: github.com/D7x7z49/workflow-as-list/blob/main/@SYNTAX.ebnf`,
  `#   "- text"          user prompt`,
  `#   "- ! command"     user shell execution`,
  `#`,
].join("\n");

export default function (pi: ExtensionAPI) {
  pi.registerCommand("wal", {
    description: "Save session as WAL file or preview in WAL format",
    handler: async (args, ctx) => {
      const parts = (args || "").trim().split(/\s+/);
      const sub = parts[0];

      if (sub === "save") {
        const filepath = parts[1]
          ? resolve(ctx.cwd, parts[1])
          : resolve(ctx.cwd, defaultWalPath(ctx));
        mkdirSync(dirname(filepath), { recursive: true });
        const steps = buildWalSteps(ctx);
        const content = WAL_HEADER + "\n" + steps.join("\n") + "\n";
        writeFileSync(filepath, content, "utf8");
        ctx.ui.notify(`WAL: saved ${steps.length} steps to ${basename(filepath)}`, "info");
        return;
      }

      if (sub === "preview") {
        const steps = buildWalSteps(ctx);
        const preview =
          steps.length > 0
            ? steps.slice(0, 20).join("\n") +
              (steps.length > 20 ? `\n... (${steps.length} total)` : "")
            : "(empty session)";
        ctx.ui.notify(`WAL preview:\n${preview}`, "info");
        return;
      }

      ctx.ui.notify("WAL usage: /wal save [path] | /wal preview", "warning");
    },
  });
}

function defaultWalPath(ctx: { sessionManager: { getSessionFile(): string | undefined } }): string {
  const sessionFile = ctx.sessionManager.getSessionFile();
  const name = sessionFile ? basename(sessionFile, extname(sessionFile)) : "session";
  const ts = new Date().toISOString().replace(/[-:]/g, "").replace(/\..+/, "");
  return join("tmp", "wal", `${name}-${ts}.wal`);
}

interface Step {
  kind: "text" | "bash";
  text: string;
  timestamp: number;
}

function buildWalSteps(ctx: { sessionManager: { getBranch(): unknown[] } }): string[] {
  const steps: Step[] = [];
  const entries = ctx.sessionManager.getBranch() as Array<{
    type: string;
    timestamp?: string;
    message?: {
      role: string;
      content?: Array<{ type: string; text?: string }>;
      command?: string;
      excludeFromContext?: boolean;
    };
  }>;

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
