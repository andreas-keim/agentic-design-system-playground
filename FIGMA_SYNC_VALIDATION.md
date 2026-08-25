# Figma token sync and validation

Target document: `agentic-design-system-playground`

> **2026-08-25 correction:** the original validation run below synced into a
> file named `Gamified activity` — an unrelated, still-empty file opened
> ad-hoc for the Safe Mode plugin session, not a file dedicated to this
> project. It has since been renamed to `agentic-design-system-playground`.
> The script no longer ships a fallback document name (see
> `scripts/sync-figma-variables.js`) — `FIGMA_DOCUMENT_NAME` is now required
> and set explicitly in the `tokens:sync:figma` script in `package.json`, so
> an ad-hoc file choice can no longer end up baked in as a silent default.

## Safe-mode workflow

1. Start the local figma-cli daemon.
2. Open `Plugins → Development → FigCli` in the target Figma document and keep the plugin window open.
3. Run `npm run tokens:sync:figma`.

Safe mode does not require a Figma access token or macOS Keychain access. The sync checks `figma.root.name` before its first write and refuses any document other than the one named in `FIGMA_DOCUMENT_NAME`. There is no default — the script errors out immediately if that variable isn't set, rather than guessing.

## Generated contract

- `src/tokens/tokens.figma.json`: Style Dictionary output with slash-separated Figma names, resolved values, scopes, web code syntax, and semantic `aliasOf` references.
- `design.json`: canonical whole-file snapshot from `figma-cli snapshot`.
- `rules/button.yaml`: contract for the three-state `Button` component set.

The Figma file contains two local collections:

- `Primitives`: 11 variables, one `Value` mode.
- `Semantics`: 6 variables, one `Value` mode; every value is a real `VARIABLE_ALIAS` to a primitive.

The `Button` component set contains `Default`, `Hover`, and `Disabled`. Its background, text, border, padding, gap, radius, font size, font weight, and line height are bound to synced variables. `Label` is exposed as a text component property.

## Validation result — 2026-08-25

| Command | Exit code | Result |
| --- | ---: | --- |
| `npm run tokens:sync:figma` | 0 | 0 created, 17 updated; no broken aliases, missing code syntax, or duplicate names |
| wrong-document guard test | 1 (expected) | Refused the connection before collection or variable writes |
| `npm run build` | 0 | TypeScript and Vite production build passed |
| `npm run lint` | 0 | Passed with one pre-existing Fast Refresh warning in `src/components/ui/button.tsx` |
| `figma-cli check` | 0 | Snapshot matches; 1/1 component contracts hold |

## figma-cli Safe Mode limitation

Safe Mode does not expose `figma.fileKey`; the target is therefore guarded by the exact document name. Its `eval --file` bridge can also parse a multiline, semicolon-free file as a single expression. Sync eval templates use explicit statement terminators so they execute reliably in that bridge.
