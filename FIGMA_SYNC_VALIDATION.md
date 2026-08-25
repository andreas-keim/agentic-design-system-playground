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

## Code-side gap found after comparing the synced Button to the live app — 2026-08-25

Comparing the Figma `Button` against `http://localhost:5173` after the sync showed a visible mismatch: Figma's Default state is 38px tall with 8/16px padding and an 8px gap (built from our real token values), while the rendered code Button was 32px tall with 10px padding and a 6px gap (`h-8 gap-1.5 px-2.5`, Tailwind's own spacing scale).

Root cause: Step 2 only bound `--primary` / `--primary-foreground` / `--radius` to our tokens. Padding, gap, height, and font metrics were never wired — the default size's `text-sm`/`font-medium` happened to equal our `font-size-md` (14px) / `font-weight-medium` (500) numerically, and `h-8`/`gap-1.5`/`px-2.5` never matched `space-component-sm/md` (8px/16px) at all. The Figma sync used the real token values (correctly) and made the accidental-vs-real distinction visible for the first time.

Fix: the default size in `src/components/ui/button.tsx` now references `--space-component-sm/md`, `--font-size-md`, `--font-line-height-md`, and `--font-weight-medium` directly instead of Tailwind's scale; the fixed `h-8` was dropped so height is implicit (line-height + padding + border), which now computes to the same 38px Figma already had. No re-sync was needed — the token *values* were already correct in Figma; only the code's binding mechanism changed from coincidental to deliberate. Verified in the browser: computed height/padding/gap/font now read 38px / 8px·16px / 8px / 14px·20px·500, matching `design.json` exactly.

Only the `size: "default"` variant was touched — `xs`/`sm`/`lg`/`icon*` still use Tailwind's own scale and were out of scope for this Figma sync (no matching Figma variants exist for them yet).
