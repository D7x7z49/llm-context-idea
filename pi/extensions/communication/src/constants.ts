// pi-good-communication: fixed values for the communication counter.
//
// contract: every export is read-only. all numbers and all user-facing text
// live here; the exemption table lives in ranges.ts.
//
// threshold note (sample report 2026-09-16, 4625 typed prompts and 12969 agent
// commands, counted with the ranges.ts table): typed prose has p90 93 and p95
// 109 units, agent commands have p90 75 and p95 97. an English word costs
// about two units, while one Han character costs one. prose 160 keeps the
// Chinese scale of the 0.1.0 limit and gives English roughly twice the room.
// shell 80 sits near the upper decile of agent commands.

// --- Identity ---

export const EXTENSION_NAME = "pi-good-communication";

// --- Thresholds ---

export const THRESHOLDS = {
  prose: 160,
  shell: 80,
} as const;

// --- Messages ---

export const MESSAGES = {
  srcMsgBlock: (units: number) =>
    `src-msg: prompt blocked at ${units} units (max ${THRESHOLDS.prose}).`
    + " write a doc or script.",

  srcCmdNotice: (units: number) =>
    `src-cmd: command blocked at ${units} units (max ${THRESHOLDS.shell}).`,

  srcCmdResult: (units: number) =>
    `command blocked by src-cmd guard. ${units} units (max ${THRESHOLDS.shell}).`
    + " write a standalone script instead.",

  dstBashNotice: (units: number) =>
    `dst-bash: agent command blocked at ${units} units (max ${THRESHOLDS.shell}).`,

  dstBashReason: (units: number) =>
    `command too complex (${units} units (max ${THRESHOLDS.shell})).`
    + " write a standalone script to scripts/ or tmp/scripts/ instead."
    + " this gives you idempotency, makes debugging easier,"
    + " and leaves an auditable record.",
};

export const FAILURE_HINT =
  `[${EXTENSION_NAME}] this command failed.`
  + " consider extracting it into a standalone script"
  + " to scripts/ or tmp/scripts/ for debugging and re-runs?";
