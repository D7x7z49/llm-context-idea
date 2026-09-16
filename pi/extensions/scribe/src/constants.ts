// pi-user-scribe: fixed values and user-facing text for the scribe exporter.
//
// contract: every export is read-only. all format tokens, all numbers, and all
// user-facing text live here.

// --- Identity ---

export const COMMAND_NAME = "scribe";
export const COMMAND_DESCRIPTION =
  "Export raw user input as plain text, or preview it with /scribe preview";
export const PREVIEW_ENTRY = "scribe-preview";
export const OUTPUT_SEGMENTS = ["tmp", "scribe"] as const;

// --- Format ---

export const TITLE = "@@ scribe - raw user input export";
export const VERSION = 1;
/** shortest hash prefix a record head carries */
export const HASH_PREFIX = 7;

// a record head is a kind token, a bracketed hash token, then bracketed flags.
// the brackets keep the colon inside one token, so no bare key value syntax
// can spread. only the flag pattern is global, and it is used with match().
export const PATTERNS = {
  recordHead: /^@@ (msg|cmd) \[sha256:([0-9a-f]{7,64})\]/,
  recordTail: /^(?: \[[a-z]+\])*$/,
  flag: /\[[a-z]+\]/g,
  counts: /^msg=(\d+) cmd=(\d+)$/,
} as const;

// --- Messages ---

export const MESSAGES = {
  // format: a reader reports the rule that broke
  notAnExport: "scribe: this text is not a scribe export",
  unsupportedVersion: (version: string) => `scribe: unsupported version "${version}"`,
  headLine: (prefix: string) =>
    `scribe: expected a head line starting with ${JSON.stringify(prefix)}`,
  headNotClosed: "scribe: the head is not closed by @@ ---",
  recordHead: (line: number, text: string) =>
    `scribe: line ${line} is not a record head: ${JSON.stringify(text)}`,
  unknownFlag: (kind: string, flag: string) =>
    `scribe: unknown ${kind} flag ${JSON.stringify(flag)}`,
  bodyHash: (hash: string) => `scribe: a record body does not match [sha256:${hash}]`,
  recordCount: (declared: number, found: number) =>
    `scribe: the head declares ${declared} records, found ${found}`,
  recordCounts: (declared: string, found: string) =>
    `scribe: the head declares ${declared}, found ${found}`,
  badCount: (field: string, value: string) =>
    `scribe: ${field} is not a count: ${JSON.stringify(value)}`,
  badCounts: (value: string) => `scribe: bad counts line: ${JSON.stringify(value)}`,

  // session: a projection needs an archive to project
  noSessionFile: "scribe: this session has no file yet, so there is no archive to project",
  emptyBranch: "scribe: the session branch is empty, so there is nothing to export",
  noLeaf: "scribe: the session has no leaf entry",

  // command: a caller error is named, never guessed
  unknownArgument: (argument: string) => `scribe: unknown argument ${JSON.stringify(argument)}`,
  previewNeedsTui: "scribe: preview needs the interactive TUI; use /scribe to write a file instead",

  // effects
  cannotWrite: (path: string, reason: string) => `scribe: cannot write ${path}: ${reason}`,
  previewHint: (bodyLines: number, expandKey: string) =>
    `... (${bodyLines} more lines, ${expandKey} to expand)`,
};
