// test/scribe.unit.test.ts
// unit tests for the scribe format, the session mapping, and the effects.

import { deepStrictEqual, ok, strictEqual, throws } from "node:assert/strict";
import { mkdtempSync, readdirSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, join } from "node:path";
import { describe, it } from "node:test";
import type { SessionEntry } from "@earendil-works/pi-coding-agent";
import { HASH_PREFIX } from "../src/constants.js";
import { exportDir, writeExport } from "../src/effect.js";
import type { ScribeRecord, SessionSource } from "../src/schema.js";
import {
  buildExport,
  commandAction,
  recordsFromBranch,
  serialize,
  sha256Hex,
  verify,
} from "../src/service.js";

// --- helpers ---

const head = { session: "session-1", leaf: "entry-9", exported: "2026-01-01T00:00:00.000Z" };
const framingLine = `@@ msg [sha256:${"0".repeat(64)}]`;
// two bodies whose digests share the first seven hex characters
const colliding: [string, string] = ["body-3083", "body-20034"];

function token(body: string): string {
  return `[sha256:${sha256Hex(body).slice(0, HASH_PREFIX)}]`;
}

function roundTrip(records: ScribeRecord[]): readonly ScribeRecord[] {
  return verify(serialize(head, records)).records;
}

// the mapping only reads type, role, and the human fields, so the mocks carry
// the session shape without repeating every pi field.
function entry(message: Record<string, unknown>, type = "message"): SessionEntry {
  return {
    type,
    id: `entry-${Math.random()}`,
    parentId: null,
    timestamp: "2026-01-01T00:00:00.000Z",
    message,
  } as unknown as SessionEntry;
}

function user(content: unknown): SessionEntry {
  return entry({ role: "user", content, timestamp: 0 });
}

function bash(command: string, excludeFromContext?: boolean): SessionEntry {
  return entry({ role: "bashExecution", command, excludeFromContext, timestamp: 0 });
}

const now = new Date("2026-01-02T03:04:05.678Z");

function source(overrides: Partial<SessionSource> = {}): SessionSource {
  return {
    getSessionFile: () => "/tmp/session.jsonl",
    getSessionId: () => "session-1",
    getLeafId: () => "entry-1",
    getBranch: () => [user([{ type: "text", text: "hello" }])],
    ...overrides,
  };
}

function withTempDir(run: (root: string) => void): void {
  const root = mkdtempSync(join(tmpdir(), "scribe-export-"));
  try {
    run(root);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

// --- serialize ---

describe("serialize", () => {
  it("writes the head and one line per record", () => {
    const text = serialize(head, [
      { kind: "msg", body: "hello", image: false },
      { kind: "cmd", body: "git status", exclude: false },
    ]);
    strictEqual(
      text,
      [
        "@@ scribe - raw user input export",
        "@@ version 1",
        "@@ session session-1",
        "@@ leaf entry-9",
        "@@ export 2026-01-01T00:00:00.000Z",
        "@@ records 2",
        "@@ counts msg=1 cmd=1",
        "@@ ---",
        `@@ msg ${token("hello")}`,
        "hello",
        `@@ cmd ${token("git status")}`,
        "git status",
        "",
      ].join("\n"),
    );
  });

  it("keeps the hash token short and bracketed", () => {
    const text = serialize(head, [{ kind: "msg", body: "hello", image: false }]);
    ok(text.includes(`@@ msg [sha256:${sha256Hex("hello").slice(0, HASH_PREFIX)}]`));
  });

  it("extends a hash prefix only while two bodies collide", () => {
    const text = serialize(head, [
      { kind: "msg", body: colliding[0], image: false },
      { kind: "msg", body: colliding[1], image: false },
      { kind: "msg", body: "hello", image: false },
    ]);
    const longer = (body: string) => `[sha256:${sha256Hex(body).slice(0, HASH_PREFIX + 1)}]`;
    ok(text.includes(longer(colliding[0])));
    ok(text.includes(longer(colliding[1])));
    ok(text.includes(token("hello")));
    deepStrictEqual(
      verify(text).records.map((record) => record.body),
      [colliding[0], colliding[1], "hello"],
    );
  });

  it("keeps the short prefix for repeated bodies", () => {
    const text = serialize(head, [
      { kind: "msg", body: "same", image: false },
      { kind: "msg", body: "same", image: false },
    ]);
    strictEqual(text.split(token("same")).length - 1, 2);
    strictEqual(verify(text).records.length, 2);
  });

  it("writes bracketed flags only", () => {
    const text = serialize(head, [
      { kind: "msg", body: "", image: true },
      { kind: "cmd", body: "", exclude: true },
    ]);
    ok(text.includes(`@@ msg ${token("")} [image]`));
    ok(text.includes(`@@ cmd ${token("")} [exclude]`));
  });

  it("writes a valid export without records", () => {
    const parsed = verify(serialize(head, []));
    deepStrictEqual(parsed.records, []);
    deepStrictEqual(parsed.counts, { msg: 0, cmd: 0 });
    strictEqual(parsed.bodyLineCount, 0);
  });
});

// --- verify ---

describe("verify", () => {
  it("round trips every record shape", () => {
    const records: ScribeRecord[] = [
      { kind: "msg", body: "plain", image: false },
      { kind: "msg", body: "with image", image: true },
      { kind: "msg", body: "", image: true },
      { kind: "cmd", body: "ls -la", exclude: false },
      { kind: "cmd", body: "private", exclude: true },
      { kind: "cmd", body: "", exclude: false },
    ];
    deepStrictEqual(roundTrip(records), records);
  });

  it("keeps multiline bodies and bodies that end with a newline", () => {
    const records: ScribeRecord[] = [
      { kind: "msg", body: "first\nsecond\n\nfourth", image: false },
      { kind: "msg", body: "tail\n", image: false },
      { kind: "msg", body: "\n", image: false },
    ];
    deepStrictEqual(roundTrip(records), records);
  });

  it("keeps a body line that looks like a framing line", () => {
    const records: ScribeRecord[] = [
      { kind: "msg", body: framingLine, image: false },
      { kind: "msg", body: `head\n${framingLine}\ntail`, image: false },
      { kind: "msg", body: "after", image: false },
    ];
    deepStrictEqual(roundTrip(records), records);
  });

  it("keeps a slash directive and a bang command untouched", () => {
    const records: ScribeRecord[] = [
      { kind: "msg", body: "/scribe preview", image: false },
      { kind: "cmd", body: "! echo literal", exclude: true },
    ];
    deepStrictEqual(roundTrip(records), records);
  });

  it("reads the declared head and counts", () => {
    const parsed = verify(
      serialize(head, [
        { kind: "msg", body: "a", image: false },
        { kind: "cmd", body: "b", exclude: false },
      ]),
    );
    deepStrictEqual(parsed.head, head);
    deepStrictEqual(parsed.counts, { msg: 1, cmd: 1 });
    strictEqual(parsed.headText.split("\n").length, 8);
    strictEqual(parsed.bodyLineCount, 4);
  });

  it("rejects a truncated body", () => {
    const text = serialize(head, [{ kind: "msg", body: "hello world", image: false }]);
    throws(() => verify(text.slice(0, text.length - 6)));
  });

  it("rejects a truncated record list", () => {
    const text = serialize(head, [
      { kind: "msg", body: "one", image: false },
      { kind: "msg", body: "two", image: false },
    ]);
    const firstRecord = text.indexOf("@@ msg", text.indexOf("@@ ---"));
    const secondRecord = text.indexOf("@@ msg", firstRecord + 1);
    throws(() => verify(text.slice(0, secondRecord)));
  });

  it("rejects a tampered body", () => {
    const text = serialize(head, [{ kind: "msg", body: "hello", image: false }]);
    throws(() => verify(text.replace("hello", "hallo")));
  });

  it("rejects an unknown flag", () => {
    const text = serialize(head, [{ kind: "msg", body: "hello", image: false }]);
    throws(() => verify(text.replace(token("hello"), `${token("hello")} [bogus]`)));
  });

  it("rejects a flag without brackets", () => {
    const text = serialize(head, [{ kind: "msg", body: "hello", image: false }]);
    throws(() => verify(text.replace(token("hello"), `${token("hello")} image`)));
  });

  it("rejects a hash token without brackets", () => {
    const text = serialize(head, [{ kind: "msg", body: "hello", image: false }]);
    throws(() => verify(text.replace(token("hello"), `sha256:${sha256Hex("hello")}`)));
  });

  it("rejects a hash prefix below the minimum length", () => {
    const text = serialize(head, [{ kind: "msg", body: "hello", image: false }]);
    const short = `[sha256:${sha256Hex("hello").slice(0, HASH_PREFIX - 1)}]`;
    throws(() => verify(text.replace(token("hello"), short)));
  });

  it("rejects an unknown version", () => {
    const text = serialize(head, []);
    throws(() => verify(text.replace("@@ version 1", "@@ version 2")));
  });

  it("rejects a mismatched count line", () => {
    const text = serialize(head, [{ kind: "msg", body: "hello", image: false }]);
    throws(() => verify(text.replace("@@ counts msg=1 cmd=0", "@@ counts msg=0 cmd=1")));
  });

  it("rejects text that is not an export", () => {
    throws(() => verify("just some text\n"));
  });
});

// --- recordsFromBranch ---

describe("recordsFromBranch", () => {
  it("maps a user text message to a message record", () => {
    deepStrictEqual(recordsFromBranch([user([{ type: "text", text: "hello" }])]), [
      { kind: "msg", body: "hello", image: false },
    ]);
  });

  it("joins several text blocks with a newline", () => {
    deepStrictEqual(
      recordsFromBranch([
        user([
          { type: "text", text: "first" },
          { type: "text", text: "second" },
        ]),
      ]),
      [{ kind: "msg", body: "first\nsecond", image: false }],
    );
  });

  it("keeps a string content as is", () => {
    deepStrictEqual(recordsFromBranch([user("plain text")]), [
      { kind: "msg", body: "plain text", image: false },
    ]);
  });

  it("marks an image block and keeps its text", () => {
    deepStrictEqual(
      recordsFromBranch([
        user([
          { type: "text", text: "look" },
          { type: "image", data: "AAAA", mimeType: "image/png" },
        ]),
      ]),
      [{ kind: "msg", body: "look", image: true }],
    );
  });

  it("keeps an image only message as an empty body", () => {
    deepStrictEqual(
      recordsFromBranch([user([{ type: "image", data: "AAAA", mimeType: "image/png" }])]),
      [{ kind: "msg", body: "", image: true }],
    );
  });

  it("maps user shell commands and their exclude flag", () => {
    deepStrictEqual(recordsFromBranch([bash("git status"), bash("private", true)]), [
      { kind: "cmd", body: "git status", exclude: false },
      { kind: "cmd", body: "private", exclude: true },
    ]);
  });

  it("keeps branch order and skips everything else", () => {
    const records = recordsFromBranch([
      entry({ role: "assistant", content: [{ type: "text", text: "answer" }] }),
      user([{ type: "text", text: "one" }]),
      entry({ role: "toolResult", content: [{ type: "text", text: "output" }] }),
      bash("ls"),
      entry({ customType: "scribe-preview" }, "custom"),
      user([{ type: "text", text: "two" }]),
    ]);
    deepStrictEqual(records, [
      { kind: "msg", body: "one", image: false },
      { kind: "cmd", body: "ls", exclude: false },
      { kind: "msg", body: "two", image: false },
    ]);
  });
});

// --- buildExport ---

describe("buildExport", () => {
  it("writes the session, the leaf, and the export time", () => {
    const parsed = verify(buildExport(source(), now));
    deepStrictEqual(parsed.head, {
      session: "session-1",
      leaf: "entry-1",
      exported: "2026-01-02T03:04:05.678Z",
    });
    deepStrictEqual(parsed.records, [{ kind: "msg", body: "hello", image: false }]);
  });

  it("refuses a session without a file", () => {
    throws(() => buildExport(source({ getSessionFile: () => undefined }), now), /no archive/);
  });

  it("refuses an empty branch", () => {
    throws(() => buildExport(source({ getBranch: () => [] }), now), /branch is empty/);
  });

  it("refuses a session without a leaf", () => {
    throws(() => buildExport(source({ getLeafId: () => null }), now), /no leaf/);
  });

  it("returns text that passes the shared validation", () => {
    const text = buildExport(source(), now);
    strictEqual(verify(text).head.session, "session-1");
    ok(text.endsWith("\n"));
  });
});

// --- commandAction ---

describe("commandAction", () => {
  it("reads an empty argument as an export", () => {
    strictEqual(commandAction(""), "export");
    strictEqual(commandAction("   "), "export");
  });

  it("reads the preview word", () => {
    strictEqual(commandAction("preview"), "preview");
    strictEqual(commandAction(" preview "), "preview");
  });

  it("refuses any other argument", () => {
    throws(() => commandAction("save"), /unknown argument/);
  });
});

// --- writeExport ---

describe("writeExport", () => {
  it("writes a UTC file name under tmp/scribe", () => {
    withTempDir((root) => {
      const path = writeExport(root, "body", now);
      strictEqual(basename(path), "20260102T030405Z.tmp");
      strictEqual(path, join(exportDir(root), "20260102T030405Z.tmp"));
      strictEqual(readFileSync(path, "utf8"), "body");
      deepStrictEqual(readdirSync(exportDir(root)), ["20260102T030405Z.tmp"]);
    });
  });

  it("refuses to replace an existing export", () => {
    withTempDir((root) => {
      const path = writeExport(root, "first", now);
      throws(() => writeExport(root, "second", now), /cannot write|EEXIST/);
      strictEqual(readFileSync(path, "utf8"), "first");
      deepStrictEqual(readdirSync(exportDir(root)), ["20260102T030405Z.tmp"]);
    });
  });

  it("leaves no partial file behind", () => {
    withTempDir((root) => {
      writeExport(root, "body", now);
      ok(readdirSync(exportDir(root)).every((name) => !name.endsWith(".partial")));
    });
  });
});
