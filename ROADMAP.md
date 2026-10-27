# Product & Architecture Master Blueprint (`ROADMAP.md`)
**Repository:** `agentic-design-system-playground`  
**Author & Lead Architect:** Andreas Keim (Senior UX Designer / Staff Design Engineer)  
**Target Role & Positioning:** Senior AI Product Designer | Staff Design Engineer | Lead Design Systems (Enterprise Tier)  
**Tech Stack:** React 19, TypeScript, Vite 8, Tailwind CSS v4, W3C DTCG Design Tokens (`src/tokens/tokens.json`), Style Dictionary (CSS & Figma JSON), Deterministic Agentic UI Validator (`src/a2ui/check.ts`)  
**Deployment & Runtime:** Vercel Hobby Tier (100% Client-Side Showcase Execution, 0.00 € Infrastructure Cost, Zero External Paid APIs)

---

## 1. Executive Summary & Strategic Goal

This project serves as a 100% NDA-free, live, interactive **Proof of Work** on the web. Instead of presenting static Figma screens or an isolated component cemetery in Storybook, it demonstrates the complete engineering and design symbiosis required for modern AI-driven enterprise software:
1. **W3C Design Token Governance:** Strict semantic token taxonomy compiled via Style Dictionary into CSS Custom Properties (`src/styles/tokens.css`) and Figma JSON (`src/tokens/tokens.figma.json`).
2. **Modern React 19 & TypeScript Architecture:** Accessible, composable B2B components (`Button`, `Input`, `FormField`, `EditEntryPanel`, `LoginPage`).
3. **Deterministic Agentic UI Governance (`src/a2ui/`):** A strict component catalog schema (`catalog.api.ts` with Zod `.strict()`) and a reproducible CLI test suite (`check.ts`) testing 12 targeted fixtures against design and schema rules (11 of 12 as expected, 1 documented semantic gap). A companion interactive browser lab (`AgenticLabView.tsx`) simulates common AI UI errors and their deterministic fixes.

---

## 2. Core Architectural Decisions (ADRs)

### ADR-01: Custom Interactive Showcase App over Public Storybook (`/` Primary Route)
* **Decision:** The Vite application serves a custom-built, high-craft **Interactive Control Room** on the root route (`/`). Storybook is not deployed as the primary public entrypoint (it remains an optional local development workbench).
* **Rationale:** Hiring Managers, VPs of Design, and Staff Engineers rarely click through raw Storybook trees. A bespoke showcase application on `/` immediately proves product sense, information architecture mastery, and high-end UI craft while integrating live prop controls and token inspection directly into the product experience.

### ADR-02: Deterministic Schema & Rule Validation via Node CLI (with Browser-Based Lab Simulation)
* **Decision:** Run the deterministic Zod schema and AST design rule validator (`src/a2ui/check.ts`) as a reproducible Node CLI suite against 12 targeted fixtures (`node --experimental-strip-types src/a2ui/check.ts`). The Agentic Lab in the showcase serves as an interactive browser-side simulation demonstrating typical error fixes (hardcoded hex colors, arbitrary spacing, missing labels).
* **Rationale:** Separates true regression testing of AI payloads from the interactive UI demonstration. The CLI suite verifies 11 of 12 targeted test cases as expected (with 1 documented semantic gap for destructive cancellations), while the browser lab allows zero-latency interactive error injection.

### ADR-03: Industry-Agnostic Enterprise B2B Framing
* **Decision:** All showcase components and AI fixtures use a universal **"Enterprise System & Access Configuration"** domain (e.g., *System Record Management*, *Role & Permission Assignment*, *Security Clearance*, *Enterprise Workspace SSO*).
* **Rationale:** Resonates universally across SaaS, FinTech, AI Startups, Industrial Tech, and Digital Health without locking the portfolio into a single vertical niche.

---

## 3. Information Architecture & User Journey (The Story Flow)

### The 5-Second Hero Pitch (Above the Fold)
When a Design Leader or Staff Engineer opens the URL, they land directly in an interactive **System Control Room** (aesthetic inspired by Linear and Vercel Geist).

* **Headline:** *Deterministic Design Systems for the Agentic Era.*
* **Projektthese:** *Ich habe ein Design System gebaut, das Agenten auf freigegebene Komponenten begrenzt und strukturierte UI-Ausgaben gegen konkrete Regeln prüft.*
* **Interactive Hero Hook:** Direct tabbed navigation between the live Workbench, the simulated Agentic Lab, the W3C Token Explorer, and the Architecture Specs with reproducible CLI test results.
  * **Workbench Mode:** Renders live B2B patterns with state pinning, calculated WCAG 2.1 contrast ratios, and Figma-style top-left token badges.
  * **Lab Mode:** Interactively simulates typical AI generation errors (hardcoded hex `#ef4444`, 13px arbitrary spacing, missing input labels) and their automatic resolution.

### Top-Level Navigation Structure
The App Shell features a sleek top navigation bar, global theme switcher (`Light` / `Dark`), and direct links to GitHub and LinkedIn.

| Navigation Tab | Primary Audience | Core Value & Functionality |
| :--- | :--- | :--- |
| **1. Component Workbench** | UX/Product Leaders & Design Systems Teams | Live B2B patterns (`EditEntryPanel`, `Button Variants`, `Form Fields`, `SSO Login`) with state pinning, calculated contrast ratios, and Figma-style token frame labels. |
| **2. Agentic UI Lab** | AI Product Leads & Staff Engineers | Interactive simulation showing how design system guardrails fix common agent errors (color, spacing, a11y labels). |
| **3. W3C Tokens** | Design Engineers & Frontend Architects | Interactive explorer for `src/tokens/tokens.json`, live computed WCAG 2.1 contrast matrix, and 4-format snippet drawer. |
| **4. Architecture Specs** | CTOs, Hiring Managers & Recruiters | Two-pathway architecture diagram (B4 → A2 bridge), Testfall 03 CLI verification, ADRs, and executive profile. |

---

## 4. Target Repository & File Structure

```text
src/
├── components/              # Core Design System Components
│   ├── ui/button.tsx        # Base UI + CVA Token-bound button
│   ├── ui/form-field.tsx    # Accessible label, hint & error wrapper
│   ├── edit-entry-panel.tsx # Complex B2B record configuration panel
│   └── login-page.tsx       # Enterprise SSO authentication view
├── tokens/                  # W3C DTCG Token Architecture
│   ├── tokens.json          # Single Source of Truth ($value, $type, useFor, avoidFor)
│   └── tokens.figma.json    # Style Dictionary Figma variable snapshot
├── styles/
│   └── tokens.css           # Style Dictionary CSS Custom Properties (:root)
├── a2ui/                    # Deterministic Governance Engine
│   ├── catalog.api.ts       # Strict component contracts & Zod .strict() schemas
│   ├── check.ts             # CLI test runner checking 12 targeted fixtures
│   ├── design-rules.ts      # AST design rules (e.g. exactly one primary CTA)
│   └── fixtures.ts          # 12 targeted test cases (valid & invalid AI payloads)
├── showcase/                # Primary Showcase Application (Root `/` UI)
│   ├── AppShell.tsx         # Responsive top navigation, theme switcher
│   ├── WorkbenchView.tsx    # Tab 1: Component Stage + Token frame labels + State Inspector
│   ├── AgenticLabView.tsx   # Tab 2: Guardrail Lab simulation + reduced-motion support
│   ├── TokenView.tsx        # Tab 3: W3C Taxonomy Filter, computed WCAG matrix & exports
│   └── SpecsView.tsx        # Tab 4: 2-Pathway diagram, Testfall 03 CLI check & ADRs
└── App.tsx                  # Root entry rendering AppShell
```

---

## 5. Phased Implementation Status (Phase 1 – Phase 4)

### Phase 1: The Interactive Foundation (MVP Showcase & Workbench) — Completed
* **Global App Shell (`AppShell.tsx`):** Responsive top navigation (390px, 768px, 1280px), instant Light/Dark theme switching via CSS Custom Properties.
* **Component Workbench (`WorkbenchView.tsx`):** Interactive Stage and Inspector with state pinning (`default`, `hover`, `focus`, `disabled`), calculated WCAG 2.1 contrast ratios for active color pairings, and Figma-style top-left frame labels.
* **Enterprise B2B Framing:** Universal enterprise patterns (`System Access & Role Configuration`, `SSO Login`).

### Phase 2: The Agentic UI Lab (Interactive Simulation) — Completed
* **Interactive Guardrail Lab (`AgenticLabView.tsx`):** Demonstrates automated fixes for three typical agent errors:
  1. *Color:* Raw `#ef4444` → Semantic token `var(--color-background-primary-default)`.
  2. *Grid:* Arbitrary `13px` spacing → 8px grid token `16px` (`var(--space-component-md)`).
  3. *A11y:* Naked `<input>` without programmatic label → Accessible `FormField` (WCAG 3.3.2).
* **Accessibility & Motion:** Instant transition under `prefers-reduced-motion: reduce` (49ms) and cancellable scanner timeouts on reset.

### Phase 3: W3C DTCG Token Deep-Dive & Snippet Export — Completed
* **Taxonomy Explorer (`TokenView.tsx`):** Faceted search across `src/tokens/tokens.json`.
* **Computed WCAG 2.1 Contrast Matrix:** Mathematical contrast calculations ($L_1 + 0.05 / L_2 + 0.05$) against White, Dark (`#09090b`), and Primary Violet (`#6d28d9`).
* **Multi-Format Developer Snippets:** Copy drawer for W3C JSON, CSS Variables, TypeScript Snippet (reference), and LLM Prompt rules.

### Phase 4: Architecture Specs & V1 Stabilization — Completed
* **Two-Pathway Architecture Diagram (`SpecsView.tsx`):** Connects Build Pipeline (B1–B4) directly to Governance Pipeline (A1–A4) via the B4 → A2 component-to-catalog link.
* **Reproducible Testfall 03:** Direct verification of CLI fixture rejection (`Unrecognized key(s) in object: 'className'`).
* **CLI Benchmark Documentation:** 11 of 12 targeted fixtures verified as expected; 1 documented semantic gap (fixture 08: destructive cancellation).
* **V1 Production Release (2026-10-27):** Live on Vercel (`agentic-design-system-playground.vercel.app`).

### Phase 5: The Agentic Experience Pattern Library (V2) — Planned
* **Strategic Concept:** Expansion from pure governance (how design systems control coding agents) to human-agent collaboration interfaces (how interfaces keep humans in the loop and in control).
* **Delivery Scope (5 Interactive AX Patterns):**
  1. `<ApprovalGate />`: Stage & Commit architecture, visual side-by-side diffs, pre-click consequence summaries, 1-click dismissal (`Esc`).
  2. `<ConfidenceBadge />`: Zoned uncertainty design (Green/Amber/Red) with progressive disclosure popovers explaining attribution drivers.
  3. `<ToolCallTracker />`: Real-time agent tool-call execution pills (`[Read SAP DB...]` → `[Validate Tokens...]`), shimmer skeletons, and graceful abort controls.
  4. `<SourceAttributionBadge />`: Clear provenance indicators (`👤 Manual` vs. `🤖 Agent SYS-REC`) with 1-click rollback to pre-AI state.
  5. `<DualAudienceTokenCard />`: Interactive visualization of W3C DTCG tokens with formal `useFor` / `avoidFor` LLM contract metadata.
* **Architecture & Delivery:** Dedicated 5th top-level navigation tab (`AX Patterns`), built on a separate feature branch (`feature/v2-ax-patterns`) to keep `main` stable.

---

## 6. Implementation Execution Checklist

- [x] **Step 1 (Branch Consolidation):** Consolidate `a2ui` governance files (`catalog.api.ts`, `check.ts`, `fixtures.ts`) into `src/a2ui/` on `main`.
- [x] **Step 2 (B2B Domain Framing):** Wire up enterprise B2B scenarios for `EditEntryPanel`, `Button`, `FormField`, and `LoginPage`.
- [x] **Step 3 (AppShell & Theme Context):** Build responsive `src/showcase/AppShell.tsx` supporting Light and Dark modes.
- [x] **Step 4 (Phase 1 – Component Workbench):** Build `src/showcase/WorkbenchView.tsx` with state pinning, calculated contrast pairs, and Figma-style frame labels.
- [x] **Step 5 (Phase 2 – Agentic UI Lab):** Build `src/showcase/AgenticLabView.tsx` with interactive error simulation and `prefers-reduced-motion` support.
- [x] **Step 6 (Phase 3 – W3C Token Explorer):** Build `src/showcase/TokenView.tsx` rendering `tokens.json` taxonomy, contrast matrix, and code snippets.
- [x] **Step 7 (Phase 4 – Architecture Specs & V1 Stabilization):** Build `src/showcase/SpecsView.tsx` with B4 → A2 connection, stabilize responsive layouts (390px, 768px, 1280px with 0 page overflows), align all statements with repo facts, and deploy to Vercel via `main`.
- [ ] **Step 8 (Phase 5 – AX Pattern Library V2):** Implement 5 core interaction patterns in `src/components/ax/` and integrate into a dedicated `AXPatternsView.tsx` tab.
