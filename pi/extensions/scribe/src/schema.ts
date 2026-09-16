// pi-user-scribe: shared data structures for the scribe exporter.
//
// contract: types only. this module has no runtime behavior. the single import
// is the pi session entry type that the session source exposes.

import type { SessionEntry } from "@earendil-works/pi-coding-agent";

// --- Export records ---

export type ScribeRecord =
  | { readonly kind: "msg"; readonly body: string; readonly image: boolean }
  | { readonly kind: "cmd"; readonly body: string; readonly exclude: boolean };

export interface ExportHead {
  readonly session: string;
  readonly leaf: string;
  readonly exported: string;
}

export interface RecordCounts {
  readonly msg: number;
  readonly cmd: number;
}

export interface ParsedExport {
  /** the declared head, as written by the exporter */
  readonly head: ExportHead;
  /** the declared counts, as written by the exporter */
  readonly counts: RecordCounts;
  /** the records found in the body */
  readonly records: readonly ScribeRecord[];
  /** the head block, title line through "@@ ---", without a trailing newline */
  readonly headText: string;
  /** body lines after the head, ignoring the newline that closes the file */
  readonly bodyLineCount: number;
}

// --- Preview ---

export interface PreviewData {
  readonly text: string;
}

// --- Session source ---

/** the read-only part of a session that a projection needs */
export interface SessionSource {
  getSessionFile(): string | undefined;
  getSessionId(): string;
  getLeafId(): string | null;
  getBranch(): readonly SessionEntry[];
}

// --- Command ---

export type CommandAction = "export" | "preview";
