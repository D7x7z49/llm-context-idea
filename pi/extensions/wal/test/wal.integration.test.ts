// integration test for pi-wal extension using pi SDK.
// uses in-memory session with injected messages — no LLM calls.

import { readFileSync, unlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import process from "node:process";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import {
  createAgentSession,
  DefaultResourceLoader,
  getAgentDir,
  SessionManager,
  SettingsManager,
} from "@earendil-works/pi-coding-agent";

const __dirname = dirname(fileURLToPath(import.meta.url));

type AppendableMessage = Parameters<SessionManager["appendMessage"]>[0];

function u(text: string): AppendableMessage {
  return {
    role: "user",
    content: [{ type: "text", text }],
    timestamp: Date.now(),
  };
}

function b(command: string, exclude?: boolean): AppendableMessage {
  return {
    role: "bashExecution",
    command,
    output: "",
    exitCode: 0,
    cancelled: false,
    truncated: false,
    excludeFromContext: exclude,
    timestamp: Date.now(),
  };
}

async function setup() {
  const sm = SessionManager.inMemory(process.cwd());
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
    settingsManager,
    resourceLoader: loader,
  });

  return { sm, session };
}

describe("pi-wal integration", () => {
  it("/wal save includes user text and bashExecution messages", async () => {
    const { sm, session } = await setup();

    sm.appendMessage(b("git status"));
    sm.appendMessage(u("check the diff"));

    const path = join(tmpdir(), `wal-test-${Date.now()}.wal`);
    await session.prompt(`/wal save ${path}`);

    try {
      const content = readFileSync(path, "utf8");
      if (!content.includes("- ! git status")) {
        throw new Error("missing bash command");
      }
      if (!content.includes("- check the diff")) {
        throw new Error("missing user message");
      }
    } finally {
      try {
        unlinkSync(path);
      } catch {
        /* ignore */
      }
      try {
        session.dispose();
      } catch {
        /* ignore */
      }
    }
  });

  it("/wal save skips !! commands", async () => {
    const { sm, session } = await setup();

    sm.appendMessage(b("sensitive", true));
    sm.appendMessage(u("public"));

    const path = join(tmpdir(), `wal-test-${Date.now()}.wal`);
    await session.prompt(`/wal save ${path}`);

    try {
      const content = readFileSync(path, "utf8");
      if (content.includes("- ! sensitive")) {
        throw new Error("!! command leaked into output");
      }
      if (!content.includes("- public")) {
        throw new Error("missing public message");
      }
    } finally {
      try {
        unlinkSync(path);
      } catch {
        /* ignore */
      }
      try {
        session.dispose();
      } catch {
        /* ignore */
      }
    }
  });
});
