# agentic-design-system-playground

A design system built from the ground up to be **correctly usable by AI agents, not just by humans** — tokens, components, and machine-readable metadata that let an agent reuse the system properly instead of guessing or reinventing it.

This is a learning project (React + shadcn/ui + Base UI + Tailwind v4 + Style Dictionary + Storybook + Figma), documented and iterated in the open. It's also a GitHub template — clone it to start a new code-first, agentic-ready design system without rebuilding the pipeline from scratch.

## Why this exists

Most "AI-ready design system" claims are untested. This project tests the claim directly: can an agent — with **no memory of any prior session, no hints beyond what's in the repo** — read a component's documentation and use it correctly, without inventing new colors, spacing, or components? And does that still hold once the task requires combining *multiple* components into a real page, not just using one in isolation?

## Three things this project actually demonstrates

**1. Multi-component composition, not just single-component correctness.** A fresh agent, given only the task "build a login page" (later: "build a sign-up page"), correctly reused an existing `Button` and `Input`, picked the right variants based on the components' own guidelines, and bound a headline to raw type-scale tokens (no `<Heading>` component exists) — without inventing a single hardcoded value. Verified independently after each run: build, lint, and an automated accessibility gate all green; a `grep` for hex colors, raw pixel values, and un-tokenized Tailwind color classes came back empty.

**2. Reusable tooling, proven not just claimed.** The script that syncs code tokens into Figma also builds Figma Text Styles bound to those tokens — a capability Figma's plugin API doesn't offer natively. It started as a function hardcoded for the `Button` component. It was generalized into `upsertTextStyle()` and proven reusable by retrofitting the existing `Button` call onto it (no regression) *and* using it a second, independent time for a new `Headline` style — not just asserted to be generic, demonstrated.

**3. A real methodology mistake, caught and shown, not hidden.** An early "organic" test (agent gets no hint about where documentation lives) was run *after* a comparable, already-solved task had been merged into `main` — the second agent could see the first solution in the repo. The resulting near-identical diff was correctly identified as **contaminated, not confirming evidence**, and discarded. The test was repeated with a genuinely different task and a stronger isolation instruction; that run held up under independent verification. The mistake, the diagnosis, and the fix are documented in [`FIGMA_SYNC_VALIDATION.md`](FIGMA_SYNC_VALIDATION.md) and the project's internal playbook — not edited out of the history.

## How it's structured

```
Tokens (W3C DTCG, tokens.json)
  → Style Dictionary → CSS variables + Figma-shaped JSON
  → Components (shadcn/ui primitives, tokens wired in, not left as raw Tailwind defaults)
  → *.meta.json (structure: props, variants, which token binds where)
  → *.guidelines.md (prose: when to use which variant, documented gotchas)
  → Figma (variables + Text Styles + component frames, synced from code — code is the source of truth, not Figma)
  → Storybook (+ @storybook/addon-mcp, so an agent can query the live component set)
  → Automated accessibility gate (Playwright + axe-core, CI-enforced, auto-files a GitHub issue on failure)
```

Every one of those arrows was built, then audited against the running app for drift — several real bugs were found this way (a button that visually matched its own design tokens by coincidence rather than by binding; a WCAG contrast failure found only once Figma's variable-driven render was compared against the app's actual computed styles). See [`ACCESSIBILITY.md`](ACCESSIBILITY.md) for the accessibility-specific findings and [`NEVER.md`](NEVER.md) for a running list of concrete mistakes turned into hard rules.

## What's in the component set

- **Button** — 6 variants × 8 sizes, tokens wired for background/text/border where the design calls for it, shadcn neutrals left alone where it doesn't (a documented, deliberate choice, not an oversight)
- **Input** — sized to match Button's height exactly (same padding/line-height tokens), so they sit correctly together in a form
- A type-scale for headlines (tokens only, no wrapper component — CSS can't bundle multi-property text styles into one variable, so it's three tokens applied together at each use site, the same pattern Button already used)

## Using this as a template

This repo is marked as a GitHub template — "Use this template" on the repo page starts a new project with the same pipeline, without the Button/Input-specific content. The parts worth keeping when you do:

- The token architecture and Style Dictionary setup (`src/tokens/`, `style-dictionary.config.js`)
- The `*.meta.json` + `*.guidelines.md` pattern per component (structure vs. prose, kept separate deliberately — see the sources below)
- `scripts/sync-figma-variables.js` and `scripts/check-accessibility.mjs`
- `NEVER.md` and the CI accessibility gate (`.github/workflows/accessibility.yml`)

## Getting started

```bash
npm install
npm run dev              # app
npm run storybook        # component explorer
npm run build && npm run lint
npm run test:a11y        # accessibility gate (builds Storybook, then runs it)
npm run tokens:sync:figma  # requires figma-cli in Safe Mode, see FIGMA_SYNC_VALIDATION.md
```

## Further reading in this repo

- [`CLAUDE.md`](CLAUDE.md) — the conventions an agent working in this repo is expected to follow
- [`NEVER.md`](NEVER.md) — a negative-rules list, each entry traced back to an actual bug found in this project, not a generic best-practices list
- [`ACCESSIBILITY.md`](ACCESSIBILITY.md) — every accessibility finding, chronologically, including the CI gate that now catches new ones automatically
- [`FIGMA_SYNC_VALIDATION.md`](FIGMA_SYNC_VALIDATION.md) — how the code→Figma sync actually works, including the primary-source research behind it and every real bug hit while building it
- [`STEP5_AGENT_TEST.md`](STEP5_AGENT_TEST.md) — the first agent test that established the core hypothesis this project tests

(These deeper docs are currently in German — the working language of the original build sessions. This README is the entry point for an English-reading audience; the underlying primary sources hold up regardless of the reader's language.)
