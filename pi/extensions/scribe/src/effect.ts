// pi-user-scribe: the pi and filesystem boundary for the scribe exporter.
//
// contract:
//   exportDir(cwd)              -> the directory an export lands in.
//   writeExport(cwd, text, date)-> the final path, or a thrown error.
//   notifyExport(ctx, path)     -> posts the path only when a UI exists.
//   publishPreview(pi, ctx, text)-> appends one preview entry, TUI mode only.
//   renderPreview(entry, opts)  -> the entry component, folded until expanded.
//
// the export is created under an exclusive name and only then hard linked into
// place, so a reader never sees a partial file and an existing export is never
// replaced silently. this module owns every side effect and every pi shape.

import { closeSync, linkSync, mkdirSync, openSync, unlinkSync, writeSync } from "node:fs";
import { join, resolve } from "node:path";
import type {
  CustomEntry,
  EntryRenderOptions,
  ExtensionAPI,
  ExtensionCommandContext,
  ExtensionContext,
  Theme,
} from "@earendil-works/pi-coding-agent";
import { keyHint } from "@earendil-works/pi-coding-agent";
import { Box, Text } from "@earendil-works/pi-tui";
import { MESSAGES, OUTPUT_SEGMENTS, PREVIEW_ENTRY } from "./constants.js";
import type { PreviewData } from "./schema.js";
import { verify } from "./service.js";

// --- Context contracts ---

type NotificationContext = Pick<ExtensionContext, "hasUI"> & {
  readonly ui: Pick<ExtensionContext["ui"], "notify">;
};

type PreviewContext = Pick<ExtensionCommandContext, "mode">;

// --- Filesystem ---

export function exportDir(cwd: string): string {
  return resolve(cwd, ...OUTPUT_SEGMENTS);
}

function fileName(date: Date): string {
  return `${date.toISOString().replace(/[-:]/g, "").replace(/\.\d+/, "")}.tmp`;
}

export function writeExport(cwd: string, text: string, date = new Date()): string {
  const dir = exportDir(cwd);
  mkdirSync(dir, { recursive: true });

  const finalPath = join(dir, fileName(date));
  const partialPath = `${finalPath}.partial`;
  let opened = false;
  try {
    let fd: number;
    try {
      fd = openSync(partialPath, "wx");
      opened = true;
    } catch (error) {
      throw new Error(MESSAGES.cannotWrite(finalPath, messageOf(error)));
    }
    try {
      writeSync(fd, text);
    } finally {
      closeSync(fd);
    }
    // a hard link refuses to replace an existing file, unlike rename
    linkSync(partialPath, finalPath);
  } finally {
    if (opened) {
      removeFile(partialPath);
    }
  }
  return finalPath;
}

function removeFile(path: string): void {
  try {
    unlinkSync(path);
  } catch {
    // the partial file is already gone
  }
}

function messageOf(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

// --- Pi effects ---

export function notifyExport(ctx: NotificationContext, path: string): void {
  if (!ctx.hasUI) {
    return;
  }
  ctx.ui.notify(path, "info");
}

export function publishPreview(pi: ExtensionAPI, ctx: PreviewContext, text: string): void {
  if (ctx.mode !== "tui") {
    throw new Error(MESSAGES.previewNeedsTui);
  }
  pi.appendEntry<PreviewData>(PREVIEW_ENTRY, { text });
}

// --- Pi rendering ---

export function renderPreview(
  entry: CustomEntry<PreviewData>,
  options: EntryRenderOptions,
  theme: Theme,
) {
  const text = entry.data?.text ?? "";
  const parsed = verify(text);
  const box = new Box(1, 1, (line) => theme.bg("customMessageBg", line));
  if (options.expanded) {
    box.addChild(new Text(text, 0, 0));
    return box;
  }
  box.addChild(new Text(parsed.headText, 0, 0));
  const hint = MESSAGES.previewHint(parsed.bodyLineCount, keyHint("app.tools.expand", "to expand"));
  box.addChild(new Text(theme.fg("dim", hint), 0, 0));
  return box;
}
