// integration test for pi-good-communication extension using the Pi SDK.
// uses an in-memory session and does not require an LLM call for blocked input.

import {
  createAgentSession,
  DefaultResourceLoader,
  getAgentDir,
  SessionManager,
  SettingsManager,
  type SessionEntry,
  type SessionMessageEntry,
} from "@earendil-works/pi-coding-agent";
import { describe, it } from "node:test";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import process from "node:process";

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

  it("src-msg blocks a prompt beyond the character limit", async () => {
    const { sessionManager, session } = await setup();

    try {
      const text = "A".repeat(200);
      await session.prompt(text);

      const userTexts = messageEntries(sessionManager.getEntries()).map(textFromUserMessage);
      if (userTexts.some((value) => value.includes(text))) {
        throw new Error("blocked prompt was stored as a user message");
      }
    } finally {
      session.dispose();
    }
  });

  it("src-cmd blocks a command beyond the character limit", async () => {
    const { sessionManager, session } = await setup();

    try {
      const command = "A".repeat(200);
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
