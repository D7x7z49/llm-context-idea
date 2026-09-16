// integration test for pi-good-communication extension using the Pi SDK.
// uses an in-memory session and does not require an LLM call for blocked input.

import { dirname, join } from "node:path";
import process from "node:process";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import {
  createAgentSession,
  DefaultResourceLoader,
  getAgentDir,
  type SessionEntry,
  SessionManager,
  type SessionMessageEntry,
  SettingsManager,
} from "@earendil-works/pi-coding-agent";

const __dirname = dirname(fileURLToPath(import.meta.url));

async function setup() {
  const sessionManager = SessionManager.inMemory(process.cwd());
  const settingsManager = SettingsManager.inMemory();

  const loader = new DefaultResourceLoader({
    cwd: process.cwd(),
    agentDir: getAgentDir(),
    additionalExtensionPaths: [join(__dirname, "..", "src", "index.ts")],
    settingsManager,
  });
  await loader.reload();

  const { session } = await createAgentSession({
    sessionManager,
    settingsManager,
    resourceLoader: loader,
  });

  return { sessionManager, session };
}

function messageEntries(entries: SessionEntry[]): SessionMessageEntry[] {
  return entries.filter((entry): entry is SessionMessageEntry => entry.type === "message");
}

function textFromUserMessage(entry: SessionMessageEntry): string {
  if (entry.message.role !== "user") {
    return "";
  }
  if (typeof entry.message.content === "string") {
    return entry.message.content;
  }

  return entry.message.content
    .filter((block): block is { type: "text"; text: string } => "text" in block)
    .map((block) => block.text)
    .join("\n");
}

describe("pi-good-communication integration", () => {
  it("src-msg allows a short prompt", async () => {
    const { session } = await setup();

    try {
      await session.prompt("hello");
    } finally {
      session.dispose();
    }
  });

  it("src-msg blocks a prompt beyond the unit limit", async () => {
    const { sessionManager, session } = await setup();

    try {
      const text = "中".repeat(200);
      await session.prompt(text);

      const userTexts = messageEntries(sessionManager.getEntries()).map(textFromUserMessage);
      if (userTexts.some((value) => value.includes(text))) {
        throw new Error("blocked prompt was stored as a user message");
      }
    } finally {
      session.dispose();
    }
  });

  it("src-cmd blocks a command beyond the unit limit", async () => {
    const { sessionManager, session } = await setup();

    try {
      const command = `${"echo focus && ".repeat(12)}echo focus`;
      await session.prompt(`! ${command}`);

      const bashCommands = messageEntries(sessionManager.getEntries())
        .filter((entry) => entry.message.role === "bashExecution")
        .map((entry) => (entry.message.role === "bashExecution" ? entry.message.command : ""));

      if (bashCommands.includes(command)) {
        throw new Error("blocked command was executed");
      }
    } finally {
      session.dispose();
    }
  });
});
