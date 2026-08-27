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

## Text Style — 2026-08-25

Figma has no composite "text" variable type (only `COLOR`/`FLOAT`/`STRING`/`BOOLEAN`); bundling font-size/weight/line-height into one reusable, named thing needs a Text Style, a separate concept from Variables that figma-cli also doesn't support natively. `upsertTextStyle()` creates/updates a Text Style named `Button`, binds it to the existing `primitive/font/size/md`, `primitive/font/weight/medium`, and `primitive/font/lineHeight/md` variables (font-weight binding works because Geist is a variable font), and applies it to the `Label` text node in all three component states via the separate `applyTextStyleToComponentSetLabels()` helper (`setTextStyleIdAsync`).

**Generalized, 2026-08-26 (Step 7):** `upsertTextStyle()` is written generic (style name + variable names as params), not Button-specific — proven by a second, independent caller: a `Headline` style (`primitive/font/size/xl`/`weight/bold`/`lineHeight/xl`), created the same way but with no component set to apply it to yet (no Figma node built for Headline). The apply-to-nodes step stayed a separate function precisely because "create/update a style" and "apply it somewhere" are independent concerns — Headline only needs the former for now.

## Font family — platform-naming mismatch, 2026-08-25

The web font-family value (`'Geist Variable'`, from `@fontsource-variable/geist`) and Figma's own font catalog name for the same font (`Geist`, confirmed via `design.json`'s `txt.font` field) are different strings — there's no single value correct for both platforms. Resolution: `font.family.base` = `"Geist Variable"` was added to `tokens.json` for the web side only; the Style Dictionary `figma` platform now filters out `fontFamily`-typed tokens (see `style-dictionary.config.js`) so `tokens.figma.json` never carries a value that would be wrong if synced verbatim. The Figma-side equivalent is a separate, manually created variable (`primitive/font/family/base` = `"Geist"`, via Figma's native font-picker → "Create Variable") — deliberately not scripted, since the two values can never be the same thing kept in sync automatically.

## Disabled state and border — aligned Figma to the code, 2026-08-25

Comparing the live app's Disabled button to Figma's Disabled variant showed a real mismatch: the code renders Disabled by taking the *same* Default colors and applying `opacity: 0.5` (computed: `background-color: rgb(59,130,246)` i.e. `blue-500`, at 50% opacity) — a deliberate Step 2 decision, sourced from Primer's guidance to use one uniform muted look across variants rather than per-variant disabled colors. `color.background.primary.disabled` / `color.text.primary.disabled` exist in `tokens.json` but were never wired into the code for exactly that reason. The automated Figma sync bound them anyway, since nothing told it they were intentionally unused, producing solid `blue-300` background / `gray-400` text in Figma instead of dimmed `blue-500` / white.

Separately, the code's `default` variant never renders a border at all (`border-transparent` in the base classes — only the unrelated `outline` variant has one), while the synced Figma Button had a visible `border/primary/default`-bound stroke on all three states.

`alignDisabledAndBorderToCode()` rebinds the Disabled variant's frame and label fills to the *Default* semantic variables, sets the frame's opacity to `0.5`, and clears the stroke on all three states. Verified live via `figma-cli eval`: Disabled now reads `background`/`text` bound to `.../default` at `opacity: 0.5`, `strokeCount: 0` — matching the app. `figma-cli check` still passes.

**Follow-up — resolved:** removed. Per this repo's `CLAUDE.md` ("Nur States anlegen, die tatsaechlich verwendet werden") `color.background.primary.disabled` / `color.text.primary.disabled`, plus the now-orphaned `colors.blue.300` / `colors.gray.400` primitives, were deleted from `tokens.json`.

## Pruning orphaned Figma variables — 2026-08-25

The sync only ever created/updated, never deleted — so the four variables above stayed behind in Figma after their `tokens.json` entries were removed. `pruneOrphanedVariables()` closes that gap: it diffs the variables in `Primitives`/`Semantics` against `tokens.figma.json` plus a small `MANUALLY_MAINTAINED_VARIABLES` whitelist (currently just `primitive/font/family/base`, which intentionally has no token entry — see "Font family" above), and reports anything left over as orphaned.

Dry-run by default — only *reports* orphans. Deleting requires `FIGMA_PRUNE_UNUSED=1` set explicitly, same reasoning as the document-name guard having no fallback default: creating/updating can be undone by running the sync again, deleting can't, so it doesn't get a default-on behavior. Ran once with the flag: deleted `primitive/blue/300`, `primitive/gray/400`, `semantic/color/background/primary/disabled`, `semantic/color/text/primary/disabled` — zero failures, `figma-cli check` still passes (14 variables).

## Input frame and Headline instance — Step 7, 2026-08-26

Unlike Button, `Input` and `Headline` had no Figma visual counterpart yet — only variables (Input) or a Text Style (Headline) existed, no actual node. Built manually via `figma-cli eval` (no reusable script this time, one-off like Button's original build in Step 2b): a `Form Fields` section below `Buttons`, containing an `Input` frame (280×38px — same height as `Button` default, confirming the shared token binding) with a bound `paddingTop/Bottom` (`primitive/space/component/sm`), `paddingLeft/Right` (`primitive/space/component/md`), and corner radius (`primitive/radius/md`), plus a `Placeholder` text child bound to `primitive/font/size/md`/`lineHeight/md`/`family/base`. Border/placeholder-text colors are literal (`#e5e5e5`/`#737373`, shadcn's `--border`/`--muted-foreground`), matching the code, which also leaves these un-tokenized. A `Headline` text node ("Welcome back") has the existing `Headline` Text Style applied via `setTextStyleIdAsync`.

**Real bug hit and fixed during the build:** `figma.createText()` returns a node with Figma's own default font (Inter) still assigned — setting `.characters` before `.fontName` throws `Cannot write to node with unloaded font`. Two failed attempts before catching this left three orphaned, unstyled `Input`/`Placeholder` node pairs floating on the page (created before the throw, never parented into a section) — found via `figma.currentPage.findAll()` by name, removed via `.remove()`. Lesson: always set `fontName` immediately after `createText()`, before touching `.characters`, and audit for stray nodes after any eval script that throws mid-run — `figma-cli check`'s `nodeCount` diff (39→49, not the expected 39→43) is what surfaced this before it got committed.

Verified via `figma-cli verify` (screenshot + `--measure`): Input renders 280×38px, Headline renders 174×32px (line-height-bound, matches `--font-line-height-xl`). `figma-cli check` clean after cleanup, `design.json` snapshot updated.

## File reorganized for legibility — 2026-08-27

Reorganized from a single unstructured page into three: `Cover` (title + tagline, for anyone opening the file cold), `Foundations` (semantic color swatches + text-style samples, built from the live variables/styles, not restated by hand), `Components` (renamed from `Page 1`; existing `Buttons`/`Form Fields` sections kept as-is). `Input` was converted from a plain `FRAME` to a real `COMPONENT` via `figma.createComponentFromNode()` — it previously didn't appear in the Assets/Components panel at all. Component-set-level descriptions added to `Button` and `Input` (the per-variant descriptions from Step 2b were already good; the top-level one was empty), pulled from the existing `*.guidelines.md` files rather than newly invented.

**Two real bugs found by Andreas looking at the live file, not by any tool check:**

- **Contrast bug:** the `text/primary/default` swatch is white (it's the button's own text color) on a white frame background — invisible. Data-only checks (`figma-cli check`, `eval` reads of fills/positions) never would have caught this, since the fill value was correct; it was a legibility problem, not a correctness problem. Fix: every swatch gets a `1px` `#e5e5e5` stroke (the same literal already used for `Input`'s border elsewhere in this file), independent of its fill color, so a future near-background token stays visible too.
- **Containment bug:** the first build used `figma.createSection()` for the `Colors`/`Typography` groupings. `eval` reads of `x`/`y`/`width`/`height`/`absoluteBoundingBox` on both the Section and its children consistently reported everything within bounds — but Andreas, looking at the actual canvas, saw the `Typography` section rendered too small with its content sitting below it, not inside it. `figma-cli verify`'s own screenshot export corroborated this once compared against the *actual* saved PNG dimensions (`sips -g pixelWidth -g pixelHeight`): the CLI's reported size (1120×320) didn't match the real file (1280×795, a completely different aspect ratio) for the `Typography` Section, while `Cover`/`Input` (both plain `FRAME`s) matched their reported sizes exactly. Root cause not fully diagnosed (Section-specific export/containment quirk in this figma-cli version, not a data-layer bug — every `eval`-based geometry read was internally consistent and wrong in the same way). **Fix, not a diagnosis:** rebuilt both groups as plain `FRAME`s instead of `SECTION`s, sized after the fact from each frame's own children's real max extents (`Math.max(...children.map(c => c.y + c.height))` + margin) rather than a guessed constant. Re-verified: `figma-cli verify`'s reported dimensions now match the actual saved PNG exactly for both, and the screenshots show all content inside its frame.
- **Lesson for future Figma-side layout work in this file:** trust a human looking at the live canvas over a script's own geometry reads when the two disagree — `eval` can read back internally-consistent-but-wrong numbers if the object type itself (here: `SECTION`) has export/containment behavior the reads don't capture. Prefer `FRAME` over `SECTION` for anything whose actual visual containment matters, and cross-check any screenshot tool's *reported* dimensions against the real saved file (`sips`/`file`) rather than trusting the tool's own metadata.

`figma-cli check` clean after both fixes (`rules: 1/1`), `design.json` snapshot updated. Figma file linked from `README.md`.

**Two further fixes from a second pass, again from Andreas looking at the live file:**

- **`Headline` was inside the `Form Fields` section.** A page headline isn't a form field — it was only there because it was built alongside `Input` in the original one-off Step 7 build, not because it belongs there. Moved to its own `Headline` section on the `Components` page, siblings with `Buttons`/`Form Fields`.
- **`Input` had no error state, even though the code does.** `input.tsx` has `aria-invalid:border-destructive` (the border turns to the shared destructive color when invalid); Figma only ever had one static `Input`. Converted `Input` into a proper `COMPONENT_SET` with a `State` property (`Default`/`Error`), matching the pattern already used for `Button` — cloned from a component that had never been in any set before (the exact precondition Step 7's `combineAsVariants` bug needed to trigger, see above), and this time it stayed clean: `variantGroupProperties` shows only `State`, no stray extra property. The `Error` variant's stroke is *bound* to `semantic/color/text/destructive/default` (the same token already visible as a swatch on `Foundations` — reused, not re-derived or guessed) rather than a literal color. Per-variant descriptions updated to match (the clone had inherited the old single-component description verbatim, which was now wrong). Deliberately scoped to just the border color, matching what `Input` itself actually owns in code — the error *message* is a `FormField` behavior (see `form-field.tsx`), not `Input`'s, and `FormField` has no Figma node yet; the variant description says so explicitly instead of implying more than what's built.

Both `Form Fields` and the new `Headline` section are `SECTION`s, not `FRAME`s (same as `Buttons`) — kept that way since Andreas confirmed the live canvas looks correct; the Section-export quirk documented above turned out to be specific to `figma-cli verify`'s screenshot tool, not the document, so it wasn't a reason to convert every Section in the file. `figma-cli check` clean, `design.json` snapshot updated.

## Third pass — real containment bug this time, plus an Auto Layout gotcha — 2026-08-27

More feedback from Andreas looking at the live file, all three real:

- **`Headline` on `Components` was a straight duplicate** of the type-scale sample already on `Foundations`' `Typography` frame — same style, same purpose (show what the Headline style looks like), no reason for it to exist twice. Deleted the whole `Headline` section from `Components`, updating the earlier "kept as a Section" note above accordingly.
- **A genuinely orphaned `Input` `INSTANCE` was found sitting directly on the `Components` page**, outside any section (`x=-5746`, well outside `Form Fields`' own bounds). Origin unclear — possibly a `figma.combineAsVariants()` side effect from the previous pass, never confirmed. Removed. Same lesson as Step 7's font-loading bug: audit for stray nodes after any script run, not just after ones that visibly throw.
- **`Form Fields` really was too small this time — not a screenshot-tool artifact.** The `Input` component set is 600px wide (`Default` + `Error` side by side) inside a `Form Fields` section that was still 500px wide, left over from the original Step 7 build. `24 + 600 = 624 > 500` — genuine overflow, confirmed by the numbers themselves, no ambiguity like the earlier `SECTION` export-quirk case. Rebuilt `Form Fields` as a `FRAME` (same fix pattern as `Foundations`), sized from real child extents. That also means the "kept as Sections, `Buttons`/`Form Fields` render fine" conclusion two sections up was half wrong in hindsight — `Buttons` still had headroom (1593px section, 493px content) so it never surfaced, but the underlying risk (a `SECTION` never auto-grows for content added after its creation) applies to any of them.
- **Added the missing error message**, and hit a real Auto Layout bug doing it: `Input`'s component frames use `layoutMode: HORIZONTAL`. Appending a new text node as a child of the `Error` variant put it *beside* the placeholder text, not below it — Auto Layout ignored the manual `x`/`y`. Fix: put the message as a sibling in `Form Fields`, positioned under the `Error` variant, instead of nesting it inside `Input` — which is also the architecturally honest choice, since `Input` itself never renders an error message in code either (`form-field.tsx`'s separate `<p>` does).
- **Second bug from the same mistake:** the first (wrong) attempt had called `.resize()` directly on the `Error` variant, which — a known Auto Layout side effect — silently flipped its `counterAxisSizingMode` from `AUTO` (hug, same as `Default`) to `FIXED` at the smaller, wrong value. Removing the wrongly-nested child afterward didn't undo that mode flip, so the variant stayed stuck at `34px` tall next to `Default`'s `38px` even after the content was fixed. Root-caused via `counterAxisSizingMode`/`primaryAxisSizingMode` inspection, not guessed. Fix: set `counterAxisSizingMode` back to `'AUTO'`, and also matched the `Error` variant's stroke to `Default`'s (`1px`/`INSIDE`, only the color differs) rather than the originally thicker `2px`/`OUTSIDE` stroke that had triggered the resize in the first place — removes the root cause instead of chasing residual pixels. Both variants are `38px` tall again.
- **Lesson:** an Auto Layout frame's manual `.resize()` is not idempotent-safe — it can silently change sizing *mode*, not just size, and that mode change outlives whatever prompted it. Prefer never calling `.resize()` directly on an Auto-Layout-managed axis; add/remove children and let it hug, or explicitly set the sizing mode alongside any manual resize.

`figma-cli check` clean, `design.json` snapshot updated. `Form Fields`' reported vs. actual screenshot dimensions now match exactly (both `FRAME`s), unlike the `SECTION`-based `Foundations` groups in the first pass.

## Fourth pass — error message baked into Input, a repeat of the resize/hug bug, and headings — 2026-08-27

Andreas wanted the error message to actually be *part of* the `Input` component (not a sibling next to it, as the third pass had it) and reserved in height even in the `Default` state, so switching states never reflows anything around it. Also asked for a real Text Style on the message (smaller than body text) and for `Buttons`/`Form Fields` to have visible headings, like `Foundations` already does.

- **Restructured `Input`:** each variant is now an outer `VERTICAL` Auto Layout wrapper (`State=Default`/`State=Error`) containing a `Field` frame (the actual bordered/padded box, unchanged visually) and an error-message text row. In `Default` the message is present but `opacity: 0` — Auto Layout still counts invisible-via-opacity children toward hug sizing (unlike `visible: false`, which would exclude it), so the height is genuinely reserved, not faked. Rebuilt both variants from scratch — reusing the *actual* `Placeholder` text nodes (moved, not recreated) rather than trying to convert the old top-level components into nested children, which would have left orphaned duplicate `COMPONENT` nodes cluttering the Assets panel.
- **Checked the code before adding a smaller size:** `form-field.tsx`'s error `<p>` currently uses `text-[length:var(--font-size-md)]` — the *same* size as body text, not smaller. Andreas asked for smaller anyway, so this is genuinely Figma-ahead-of-code, not a rediscovery of an existing token. Added `primitive/font/size/sm` (12px) and `primitive/font/lineHeight/sm` (16px) directly via the Variables API, plus a `Caption` Text Style (same create-or-update pattern as `Button`/`Headline`), and added both new variables to `MANUALLY_MAINTAINED_VARIABLES` in `sync-figma-variables.js` so the next sync's prune step doesn't delete them. **Not yet backported to code** — `form-field.tsx` still renders its error text at `--font-size-md`. Flagging this explicitly rather than letting it look synced when it isn't.
- **Hit the exact same Auto Layout bug as the third pass, on the first attempt:** built the `Field` frame with `counterAxisSizingMode = 'AUTO'`, then immediately called `field.resize(280, 10)` "just to fix the width" — which is precisely the sequence that flipped the mode to `FIXED` at the placeholder value before real content existed to compute a correct hug height. Result: the field rendered at `18px` tall while its own text child was `20px` tall and positioned at `y: 9`, i.e. the text visibly overflowed its own container — this is what produced the doubled/ghosted-looking render Andreas would have seen, not a Figma cache bug this time. Root-caused via a direct node-tree dump (`x`/`y`/`w`/`h` per child), not guessed. **Fix:** rebuilt again, this time never calling `.resize()` on the `Field` frame at all — set `primaryAxisSizingMode`/`counterAxisSizingMode` to `AUTO` on both axes, apply padding bindings, append the child, and let width *and* height hug naturally. Content-driven width (~155px) replaced the old fixed 280px; not treated as a regression, since 280 was itself only an arbitrary demo width from the original Step 7 build, not a real constraint.
- **Two variant-level component instances also got cleaned up here** — a second stray top-level `Input` `INSTANCE` had reappeared on the `Components` page after the previous pass's `combineAsVariants` call (same unconfirmed cause as before), removed again.
- **Added headings:** `Buttons` and `Form Fields` each got a `16px` `Medium` heading text (`Buttons`, `Form Fields`) at the top, matching `Foundations`' `Colors (semantic)`/`Typography (text styles)` pattern; existing content shifted down to make room, containers resized to fit.

`figma-cli check` clean (`rules: 1/1`), `design.json` snapshot updated (23 variables now, up from 21 — the two new `sm` typography primitives).
