// test/scribe.integration.test.ts
// integration test for pi-user-scribe through the pi SDK.
// uses a persisted session in a temp dir, with no LLM calls.

import { deepStrictEqual, ok, strictEqual } from "node:assert/strict";
import { mkdtempSync, readdirSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import {
  createAgentSession,
  DefaultResourceLoader,
  type ExtensionError,
  getAgentDir,
  SessionManager,
  SettingsManager,
} from "@earendil-works/pi-coding-agent";
import { exportDir } from "../src/effect.js";
import { verify } from "../src/service.js";

const here = dirname(fileURLToPath(import.meta.url));

type AppendableMessage = Parameters<SessionManager["appendMessage"]>[0];

function user(text: string): AppendableMessage {
  return { role: "user", content: [{ type: "text", text }], timestamp: Date.now() };
}

function bash(command: string, exclude?: boolean): AppendableMessage {
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
  const root = mkdtempSync(join(tmpdir(), "scribe-"));
  const sessionManager = SessionManager.create(root, join(root, "sessions"));
  const settingsManager = SettingsManager.inMemory();
  const loader = new DefaultResourceLoader({
    cwd: root,
    agentDir: getAgentDir(),
    additionalExtensionPaths: [join(here, "..", "src", "index.ts")],
    settingsManager,
  });
  await loader.reload();

  const { session } = await createAgentSession({
    sessionManager,
    settingsManager,
    resourceLoader: loader,
  });
  return { root, sessionManager, session };
}

describe("pi-user-scribe integration", () => {
  it("/scribe writes a verified export of the human side", async () => {
    const { root, sessionManager, session } = await setup();
    try {
      sessionManager.appendMessage(user("hello\nworld"));
      sessionManager.appendMessage(bash("git status"));
      sessionManager.appendMessage(bash("secret", true));

      await session.prompt("/scribe");

      const dir = exportDir(root);
      const files = readdirSync(dir);
      strictEqual(files.length, 1);
      const parsed = verify(readFileSync(join(dir, files[0] ?? ""), "utf8"));
      strictEqual(parsed.head.session, sessionManager.getSessionId());
      strictEqual(parsed.head.leaf, sessionManager.getLeafId());
      deepStrictEqual(parsed.records, [
        { kind: "msg", body: "hello\nworld", image: false },
        { kind: "cmd", body: "git status", exclude: false },
        { kind: "cmd", body: "secret", exclude: true },
      ]);
    } finally {
      session.dispose();
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("/scribe preview appends the same export as a custom entry", async () => {
    const { root, sessionManager, session } = await setup();
    try {
      sessionManager.appendMessage(user("hello"));
      sessionManager.appendMessage(bash("ls"));

      await session.bindExtensions({ mode: "tui" });
      await session.prompt("/scribe preview");

      const entries = sessionManager.getEntries().filter((entry) => entry.type === "custom");
      strictEqual(entries.length, 1);
      const entry = entries[0];
      ok(entry);
      const parsed = verify((entry.data as { text: string }).text);
      strictEqual(parsed.head.session, sessionManager.getSessionId());
      deepStrictEqual(parsed.records, [
        { kind: "msg", body: "hello", image: false },
        { kind: "cmd", body: "ls", exclude: false },
      ]);
    } finally {
      session.dispose();
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("/scribe preview fails loudly outside the TUI", async () => {
    const { root, sessionManager, session } = await setup();
    const errors: ExtensionError[] = [];
    session.extensionRunner.onError((error) => errors.push(error));
    try {
      sessionManager.appendMessage(user("hello"));

      await session.prompt("/scribe preview");

      strictEqual(errors.length, 1);
      strictEqual(errors[0]?.event, "command");
      ok(errors[0]?.error.includes("interactive TUI"));
      deepStrictEqual(
        sessionManager.getEntries().filter((entry) => entry.type === "custom"),
        [],
      );
    } finally {
      session.dispose();
      rmSync(root, { recursive: true, force: true });
    }
  });
});
