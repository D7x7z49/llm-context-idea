// test/communication.integration.test.ts
// integration test for pi-good-communication extension using pi SDK.
// uses in-memory session — no LLM calls.

import {
  AuthStorage,
  createAgentSession,
  DefaultResourceLoader,
  getAgentDir,
  ModelRegistry,
  SessionManager,
  SettingsManager,
} from "@earendil-works/pi-coding-agent";
import { describe, it } from "node:test";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

async function setup() {
  const sm = SessionManager.inMemory(process.cwd());
  const authStorage = AuthStorage.create();
  const modelRegistry = ModelRegistry.create(authStorage);
  const settingsManager = SettingsManager.inMemory();

  const loader = new DefaultResourceLoader({
    cwd: process.cwd(),
    agentDir: getAgentDir(),
    additionalExtensionPaths: [join(__dirname, "..", "src", "index.ts")],
    settingsManager,
  });
  await loader.reload();

  const { session } = await createAgentSession({
    sessionManager: sm,
    authStorage,
    modelRegistry,
    settingsManager,
    resourceLoader: loader,
  });

  return { sm, session };
}

function longText(minLen: number): string {
  return "A".repeat(minLen);
}

describe("pi-good-communication integration", () => {
  it("src-msg allows short prompts", async () => {
    const { session } = await setup();

    try {
      await session.prompt("hello");
    } finally {
      try {
        session.dispose();
      } catch {
        /* ignore */
      }
    }
  });

  it("src-msg blocks prompts exceeding WARN_MAX", async () => {
    const { sm, session } = await setup();

    try {
      const text = longText(200);
      await session.prompt(text);

      // after blocked input, no user message with the long text should appear
      const entries = sm.getEntries();
      const userMsgs = entries.filter(
        (e) =>
          e.type === "message" &&
          e.message &&
          (e.message as Record<string, unknown>).role === "user",
      );

      for (const msg of userMsgs) {
        const content = (msg.message as Record<string, unknown>).content as Array<{
          text?: string;
        }>;
        if (!content) continue;
        for (const block of content) {
          if (block.text && block.text.length > 120) {
            throw new Error("blocked prompt was stored as user message");
          }
        }
      }
    } finally {
      try {
        session.dispose();
      } catch {
        /* ignore */
      }
    }
  });

  it("src-cmd blocks long commands", async () => {
    const { sm, session } = await setup();

    try {
      const cmd = longText(200);
      await session.prompt(`! ${cmd}`);

      // verify the long command was not executed
      const entries = sm.getEntries();
      const bashMsgs = entries.filter(
        (e) =>
          e.type === "message" &&
          e.message &&
          (e.message as Record<string, unknown>).role === "bashExecution",
      );

      for (const msg of bashMsgs) {
        const msgObj = msg.message as Record<string, unknown>;
        const command = msgObj.command as string;
        if (!command) continue;
        if (command.length > 120) {
          throw new Error(`blocked command was executed: ${command.slice(0, 50)}...`);
        }
      }
    } finally {
      try {
        session.dispose();
      } catch {
        /* ignore */
      }
    }
  });
});
