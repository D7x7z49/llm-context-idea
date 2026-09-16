// pi-user-scribe: export the human side of a session as plain text.
//
// contract:
//   /scribe          -> write an export under tmp/scribe, then notify its path.
//   /scribe preview  -> append a rendered export to the transcript.
//
// the session is read through ctx.sessionManager, not through live hooks: a
// file read is idempotent, reproducible, and also works for past sessions.
// this module only wires the command and the renderer. it holds no rules.

import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { COMMAND_DESCRIPTION, COMMAND_NAME, PREVIEW_ENTRY } from "./constants.js";
import { notifyExport, publishPreview, renderPreview, writeExport } from "./effect.js";
import type { PreviewData } from "./schema.js";
import { buildExport, commandAction } from "./service.js";

export default function (pi: ExtensionAPI) {
  pi.registerEntryRenderer<PreviewData>(PREVIEW_ENTRY, renderPreview);

  pi.registerCommand(COMMAND_NAME, {
    description: COMMAND_DESCRIPTION,
    handler: async (args, ctx) => {
      switch (commandAction(args)) {
        case "export": {
          const now = new Date();
          const path = writeExport(ctx.cwd, buildExport(ctx.sessionManager, now), now);
          notifyExport(ctx, path);
          return;
        }
        case "preview":
          publishPreview(pi, ctx, buildExport(ctx.sessionManager));
          return;
      }
    },
  });
}
