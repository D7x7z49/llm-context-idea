# pi ecosystem

extensions, skills, and prompts for the pi coding agent.

## layout

```text
pi/
├── README.md
├── package.json          shared dev tooling
├── tsconfig.json
├── extensions/           pi extensions (typescript)
│   ├── communication/    message shape guards
│   ├── scribe/           user input export
│   └── wal/              WAL workflow extension (dormant)
└── skills/               pi skills (markdown)
```

## development

each extension is self-contained with its own package.json.
develop with `pi -e` pointing to the source entry:

```bash
pi -e pi/extensions/scribe/src/index.ts
```

no build step needed — pi uses jiti for runtime ts compilation.

## dependencies

pi provides these packages at runtime.
declare as peerDependencies with `"*"` range:

```text
@earendil-works/pi-coding-agent
@earendil-works/pi-tui
@earendil-works/pi-ai
typebox
```

for other npm deps, add them to the extension's own `package.json`.
then run `npm install` in that directory.

## loading strategy

```text
dev phase     pi -e pi/extensions/<name>/src/index.ts
daily use     ln -s pi/extensions/<name> .pi/extensions/<name>
release       git tag → pi install git:github.com/D7x7z49/llm-context-idea@tag
npm publish   pi install npm:@d7x7/pi-<name>
```

## reference

pi extension docs: bundled with pi at `lib/node_modules/.../docs/extensions.md`.

pi packages docs: bundled with pi at `lib/node_modules/.../docs/packages.md`.
