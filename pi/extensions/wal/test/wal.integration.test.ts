// test/wal.integration.test.ts
// integration test for pi-wal extension using pi SDK.
// uses in-memory session with injected messages — no LLM calls.

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
import { readFileSync, unlinkSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { tmpdir } from "node:os";

const __dirname = dirname(fileURLToPath(import.meta.url));

interface UserLike {
  role: "user";
  content: { type: "text"; text: string }[];
  timestamp: number;
}

interface BashLike {
  role: "bashExecution";
  command: string;
  output: string;
  exitCode: number;
  cancelled: boolean;
  truncated: boolean;
  excludeFromContext?: boolean;
  timestamp: number;
}

function u(text: string): UserLike {
  return {
    role: "user",
    content: [{ type: "text" as const, text }],
    timestamp: Date.now(),
  };
}

function b(command: string, exclude?: boolean): BashLike {
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

describe("pi-wal integration", () => {
  it("/wal save includes user text and bashExecution messages", async () => {
    const { sm, session } = await setup();

    sm.appendMessage(b("git status") as any);
    sm.appendMessage(u("check the diff") as any);

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

    sm.appendMessage(b("sensitive", true) as any);
    sm.appendMessage(u("public") as any);

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
