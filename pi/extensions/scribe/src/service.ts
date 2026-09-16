// pi-user-scribe: pure projection logic for the scribe exporter.
//
// contract:
//   sha256Hex(body)          -> the digest of the body bytes in lowercase hex.
//   serialize(head, records) -> the complete export text.
//   verify(text)             -> the parsed export, or a thrown error naming the
//                               broken rule; a declared count is an expectation.
//   recordsFromBranch(branch)-> the human records, in branch order.
//   buildExport(source, now) -> a verified export text, or a thrown error.
//   commandAction(args)      -> "export" or "preview", or a thrown error.
//
// this module performs no IO and keeps no state. a record body ends at the next
// framing line whose hash verifies, so a body line that looks like framing is
// harmless: its hash will not verify.

import { createHash } from "node:crypto";
import type { SessionEntry, SessionMessageEntry } from "@earendil-works/pi-coding-agent";
import { HASH_PREFIX, MESSAGES, PATTERNS, TITLE, VERSION } from "./constants.js";
import type {
  CommandAction,
  ExportHead,
  ParsedExport,
  RecordCounts,
  ScribeRecord,
  SessionSource,
} from "./schema.js";

type UserMessage = Extract<SessionMessageEntry["message"], { role: "user" }>;

// --- Format ---

export function sha256Hex(body: string): string {
  return createHash("sha256").update(body, "utf8").digest("hex");
}

export function serialize(head: ExportHead, records: readonly ScribeRecord[]): string {
  const counts = countRecords(records);
  const hashes = shortHashes(records);
  const lines = [
    TITLE,
    `@@ version ${VERSION}`,
    `@@ session ${head.session}`,
    `@@ leaf ${head.leaf}`,
    `@@ export ${head.exported}`,
    `@@ records ${records.length}`,
    `@@ counts ${countText(counts)}`,
    "@@ ---",
  ];
  for (const [index, record] of records.entries()) {
    lines.push(recordHead(record, hashes[index]), record.body);
  }
  return `${lines.join("\n")}\n`;
}

export function verify(text: string): ParsedExport {
  const lines = text.split("\n");
  if (lines.length < 8 || !(lines[0] ?? "").startsWith("@@ ")) {
    throw new Error(MESSAGES.notAnExport);
  }

  // line 0 is the title. it is prose for humans and agents, so it is never parsed.
  let i = 1;
  const version = headValue(lines[i++], "@@ version ");
  if (version !== String(VERSION)) {
    throw new Error(MESSAGES.unsupportedVersion(version));
  }
  const head: ExportHead = {
    session: headValue(lines[i++], "@@ session "),
    leaf: headValue(lines[i++], "@@ leaf "),
    exported: headValue(lines[i++], "@@ export "),
  };
  const declaredRecords = countValue(headValue(lines[i++], "@@ records "), "@@ records");
  const counts = parseCounts(headValue(lines[i++], "@@ counts "));
  if (lines[i++] !== "@@ ---") {
    throw new Error(MESSAGES.headNotClosed);
  }
  const headLineCount = i;

  const records: ScribeRecord[] = [];
  while (i < lines.length) {
    const line = lines[i] ?? "";
    if (i === lines.length - 1 && line === "") {
      break; // the newline that closes the file, not a record
    }
    const match = PATTERNS.recordHead.exec(line);
    if (match === null || !PATTERNS.recordTail.test(line.slice(match[0].length))) {
      throw new Error(MESSAGES.recordHead(i + 1, line));
    }
    const kind = match[1] === "cmd" ? "cmd" : "msg";
    const flags = parseFlags(kind, line.slice(match[0].length));
    const record = readRecord(lines, i + 1, match[2]);
    records.push(
      kind === "cmd"
        ? { kind, body: record.body, exclude: flags.exclude }
        : { kind, body: record.body, image: flags.image },
    );
    i = record.next;
  }

  if (records.length !== declaredRecords) {
    throw new Error(MESSAGES.recordCount(declaredRecords, records.length));
  }
  const found = countRecords(records);
  if (found.msg !== counts.msg || found.cmd !== counts.cmd) {
    throw new Error(MESSAGES.recordCounts(countText(counts), countText(found)));
  }

  const body = lines.slice(headLineCount);
  if (body[body.length - 1] === "") {
    body.pop();
  }
  return {
    head,
    counts,
    records,
    headText: lines.slice(0, headLineCount).join("\n"),
    bodyLineCount: body.length,
  };
}

function recordHead(record: ScribeRecord, hash: string): string {
  const token = `[sha256:${hash}]`;
  if (record.kind === "cmd") {
    return record.exclude ? `@@ cmd ${token} [exclude]` : `@@ cmd ${token}`;
  }
  return record.image ? `@@ msg ${token} [image]` : `@@ msg ${token}`;
}

// the shortest prefix per hash that stays unique inside this file, so a head
// stays short while a collision is still readable. equal digests share one
// prefix, because no length can separate them.
function shortHashes(records: readonly ScribeRecord[]): string[] {
  const hashes = records.map((record) => sha256Hex(record.body));
  return hashes.map((hash) => {
    let length = HASH_PREFIX;
    for (const other of hashes) {
      if (other !== hash) {
        length = Math.max(length, commonPrefixLength(hash, other) + 1);
      }
    }
    return hash.slice(0, length);
  });
}

function commonPrefixLength(a: string, b: string): number {
  let i = 0;
  while (i < a.length && i < b.length && a[i] === b[i]) {
    i++;
  }
  return i;
}

function countRecords(records: readonly ScribeRecord[]): RecordCounts {
  let msg = 0;
  for (const record of records) {
    if (record.kind === "msg") {
      msg++;
    }
  }
  return { msg, cmd: records.length - msg };
}

function countText(counts: RecordCounts): string {
  return `msg=${counts.msg} cmd=${counts.cmd}`;
}

// read a record body up to the next framing line whose hash verifies, or up to
// the end of the file. a body may end with a newline, so one trailing newline
// is dropped and retried before the hash is called a mismatch.
function readRecord(
  lines: readonly string[],
  start: number,
  hash: string,
): {
  body: string;
  next: number;
} {
  const body: string[] = [];
  let i = start;
  while (i < lines.length) {
    const line = lines[i] ?? "";
    const joined = body.join("\n");
    if (PATTERNS.recordHead.test(line) && sha256Hex(joined).startsWith(hash)) {
      return { body: joined, next: i };
    }
    body.push(line);
    i++;
  }
  const joined = body.join("\n");
  if (sha256Hex(joined).startsWith(hash)) {
    return { body: joined, next: i };
  }
  const trimmed = joined.endsWith("\n") ? joined.slice(0, -1) : joined;
  if (sha256Hex(trimmed).startsWith(hash)) {
    return { body: trimmed, next: i };
  }
  throw new Error(MESSAGES.bodyHash(hash));
}

function parseFlags(kind: "msg" | "cmd", text: string): { image: boolean; exclude: boolean } {
  const flags = { image: false, exclude: false };
  for (const token of text.match(PATTERNS.flag) ?? []) {
    const flag = token.slice(1, -1);
    if (flag === "image" && kind === "msg") {
      flags.image = true;
    } else if (flag === "exclude" && kind === "cmd") {
      flags.exclude = true;
    } else {
      throw new Error(MESSAGES.unknownFlag(kind, flag));
    }
  }
  return flags;
}

function headValue(line: string | undefined, prefix: string): string {
  if (line === undefined || !line.startsWith(prefix)) {
    throw new Error(MESSAGES.headLine(prefix));
  }
  return line.slice(prefix.length);
}

function countValue(value: string, field: string): number {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 0) {
    throw new Error(MESSAGES.badCount(field, value));
  }
  return parsed;
}

function parseCounts(value: string): RecordCounts {
  const match = PATTERNS.counts.exec(value);
  if (match?.[1] === undefined || match[2] === undefined) {
    throw new Error(MESSAGES.badCounts(value));
  }
  return { msg: Number(match[1]), cmd: Number(match[2]) };
}

// --- Session mapping ---

export function recordsFromBranch(branch: readonly SessionEntry[]): ScribeRecord[] {
  const records: ScribeRecord[] = [];
  for (const entry of branch) {
    if (entry.type !== "message") {
      continue;
    }
    const message = entry.message;
    if (message.role === "user") {
      records.push(userRecord(message.content));
    } else if (message.role === "bashExecution") {
      records.push({
        kind: "cmd",
        body: message.command,
        exclude: message.excludeFromContext === true,
      });
    }
  }
  return records;
}

function userRecord(content: UserMessage["content"]): ScribeRecord {
  if (typeof content === "string") {
    return { kind: "msg", body: content, image: false };
  }
  const text: string[] = [];
  let image = false;
  for (const block of content) {
    if (block.type === "text") {
      text.push(block.text);
    } else if (block.type === "image") {
      image = true;
    }
  }
  return { kind: "msg", body: text.join("\n"), image };
}

// --- Projection ---

export function buildExport(source: SessionSource, now = new Date()): string {
  if (source.getSessionFile() === undefined) {
    throw new Error(MESSAGES.noSessionFile);
  }
  const branch = source.getBranch();
  if (branch.length === 0) {
    throw new Error(MESSAGES.emptyBranch);
  }
  const leaf = source.getLeafId();
  if (leaf === null) {
    throw new Error(MESSAGES.noLeaf);
  }

  const text = serialize(
    { session: source.getSessionId(), leaf, exported: now.toISOString() },
    recordsFromBranch(branch),
  );
  // the export and the preview must pass the same validation
  verify(text);
  return text;
}

// --- Command ---

export function commandAction(args: string): CommandAction {
  const action = args.trim();
  if (action === "") {
    return "export";
  }
  if (action === "preview") {
    return "preview";
  }
  throw new Error(MESSAGES.unknownArgument(action));
}
