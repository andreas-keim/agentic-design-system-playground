# Product & Architecture Master Blueprint (`ROADMAP.md`)
**Repository:** `agentic-design-system-playground`  
**Author & Lead Architect:** Andreas Keim (Senior UX Designer / Staff Design Engineer)  
**Target Role & Positioning:** Senior AI Product Designer | Staff Design Engineer | Lead Design Systems (Enterprise Tier)  
**Tech Stack:** React 19, TypeScript, Vite 8, Tailwind CSS v4, W3C DTCG Design Tokens (`design.json`), Style Dictionary, Deterministic Agentic UI Validator (`A2UI`)  
**Deployment & Runtime:** Vercel Hobby Tier (100% Client-Side Execution, 0.00 € Infrastructure Cost, Zero External Paid APIs)

---

## 1. Executive Summary & Strategic Goal

This project serves as a 100% NDA-free, live, interactive **Proof of Work** on the web. Instead of presenting static Figma screens or an isolated component cemetery in Storybook, it demonstrates the complete engineering and design symbiosis required for modern AI-driven enterprise software:
1. **W3C Design Token Governance:** Strict semantic token taxonomy (`Category.Subcategory.Role.State`) compiled via Style Dictionary into CSS Custom Properties and TypeScript types.
2. **Modern React 19 & TypeScript Architecture:** Accessible, composable B2B components (`Button`, `Input`, `FormField`, `EditEntryPanel`, `LoginPage`, `SignUpPage`).
3. **Deterministic Agentic / Generative UI (`A2UI`):** A client-side validation engine (`check.ts` + `catalog.api.ts`) that proves how design systems prevent LLMs and coding agents from hallucinating rogue styles, breaking spacing scales, or violating WCAG accessibility rules.

---

## 2. Core Architectural Decisions (ADRs)

### ADR-01: Custom Interactive Showcase App over Public Storybook (`/` Primary Route)
* **Decision:** The Vite application serves a custom-built, high-craft **Interactive Control Room** on the root route (`/`). Storybook is not deployed as the primary public entrypoint (it remains an optional local development workbench).
* **Rationale:** Hiring Managers, VPs of Design, and Staff Engineers rarely click through raw Storybook trees. A bespoke showcase application on `/` immediately proves product sense, information architecture mastery, and high-end UI craft while integrating live prop controls and token inspection directly into the product experience.

### ADR-02: Pure Client-Side Agentic Validation (`a2ui` Engine)
* **Decision:** Consolidate the `a2ui-experiment` branch (`catalog.api.ts`, `check.ts`, `fixtures.ts`) into `main` as pure, deterministic TypeScript functions running directly in the browser.
* **Rationale:** Evaluates structured UI payloads in real time (< 2ms execution) with zero server latency, zero API key exposure, and 0.00 € hosting cost on Vercel. Visitors can interactively mutate payloads and watch the validator catch and remediate LLM hallucinations live.

### ADR-03: Industry-Agnostic Enterprise B2B Framing
* **Decision:** All showcase components and AI fixtures use a universal **"Enterprise System & Access Configuration"** domain (e.g., *System Record Management*, *Role & Permission Assignment*, *Security Clearance*, *Enterprise Workspace SSO*).
* **Rationale:** Resonates universally across SaaS, FinTech, AI Startups, Industrial Tech, and Digital Health without locking the portfolio into a single vertical niche.

---

## 3. Information Architecture & User Journey (The Story Flow)

### The 5-Second Hero Pitch (Above the Fold)
When a Design Leader or Staff Engineer opens the URL, they land directly in an interactive **System Control Room** (aesthetic inspired by Linear and Vercel Geist).

* **Headline:** *Deterministic Design Systems for the Agentic Era.*
* **Subline:** *Bridging W3C Design Tokens, React 19 Architecture, and Guardrailed Generative UI for Mission-Critical Enterprise Applications.*
* **Interactive Hero Hook (Immediate Aha-Moment):** A prominent split-mode toggle directly in the hero section:  
  `[ Mode: Raw LLM Output (Ungoverned) ]` vs. `[ Mode: Agentic System Guardrails (W3C Enforced) ]`
  * **Raw Mode:** Renders the `EditEntryPanel` with typical AI hallucinations (hardcoded hex codes like `#3b82f6`, off-grid padding `13px`, missing `FormField` ARIA labels, low contrast) highlighted by red diagnostic badges generated live by `check.ts`.
  * **Guardrailed Mode:** Smoothly transitions the UI into 100% W3C-token-compliant components. All diagnostic metrics turn green (`100% Token Compliance | WCAG AAA | 0 Hallucinations`).

### Top-Level Navigation Structure
The App Shell features a sleek top navigation bar, global theme switcher (`Light` / `Dark` / `High-Contrast`), a global **`[ Token X-Ray: ON/OFF ]`** toggle, a `Cmd + K` command palette, and a **Role-Based Guided Tour** selector.

| Navigation Tab | Primary Audience | Core Value & Functionality |
| :--- | :--- | :--- |
| **1. Component Workbench** | UX/Product Leaders & Design Systems Teams | Live B2B patterns (`EditEntryPanel`, `LoginPage`, `SignUpPage`, `FormField`, `Input`, `Button`) with interactive state pinning and bidirectional Token X-Ray inspection. |
| **2. Agentic UI Lab (`A2UI`)** | AI Product Leads & Staff Engineers | Interactive before/after stress-test showing how `catalog.api.ts` and `check.ts` deterministically prevent LLM UI hallucinations, including a live error-injection sandbox. |
| **3. W3C Token Explorer** | Design Engineers & Frontend Architects | Interactive explorer for `design.json` (`Category.Subcategory.Role.State`), primitive-to-semantic alias graphs, live WCAG/APCA contrast matrix, and multi-format developer export. |
| **4. Architecture & Specs** | CTOs, Hiring Managers & Recruiters | End-to-end build pipeline diagrams, ADRs, business ROI of Agentic Design Systems, and executive profile/contact of Andreas Keim. |

---

## 4. Target Repository & File Structure

To implement this cleanly within the existing Vite 8 + React 19 + Tailwind v4 setup, the `src/` directory is structured as follows:

```text
src/
├── components/              # Existing Core Design System Components
│   ├── Button/              # All variants & interactive states
│   ├── Input/               # Token-governed text input
│   ├── FormField/           # Accessible label, hint & error wrapper
│   ├── EditEntryPanel/      # Complex B2B record configuration panel
│   ├── LoginPage/           # Enterprise SSO authentication view
│   └── SignUpPage/          # Workspace provisioning & registration view
├── tokens/                  # W3C DTCG Token Architecture
│   ├── design.json          # Single Source of Truth (Category.Subcategory.Role.State)
│   └── generated/           # Style Dictionary outputs (CSS Custom Properties, TS Union Types)
├── a2ui/                    # Consolidated from branch `a2ui-experiment`
│   ├── catalog.api.ts       # Strict component contracts & allowed token schemas for AI agents
│   ├── check.ts             # Pure client-side deterministic validator returning ValidationResult
│   └── fixtures.ts          # B2B Enterprise scenarios (Ungoverned LLM vs. Guardrailed payloads)
├── showcase/                # Primary Showcase Application (Root `/` UI)
│   ├── AppShell.tsx         # Top navigation, Theme Switcher, Global X-Ray Toggle, Role Tour
│   ├── HeroControlBar.tsx   # 5-second pitch + Quick Guardrail Toggle + System Status Metrics
│   ├── WorkbenchView.tsx    # Tab 1: Component Stage + Live Props/State/Token Inspector
│   ├── AgenticLabView.tsx   # Tab 2: 3-Column A2UI Validator Lab & Live Rule Mutator
│   ├── TokenView.tsx        # Tab 3: W3C Taxonomy Filter, Alias Graph & Contrast Matrix
│   └── SpecsView.tsx        # Tab 4: Pipeline Architecture Diagram, ADRs & About Andreas Keim
└── App.tsx                  # Root entry rendering AppShell
```

---

## 5. Phased Implementation Roadmap (Phase 1 – Phase 4)

### Phase 1: The Interactive Foundation (MVP Showcase & Workbench)
**Objective:** Replace the minimal developer test surface on Vercel with the high-craft `AppShell` and `WorkbenchView`, framing all existing components in a cohesive Enterprise B2B context.

#### Deliverables
* **Global App Shell (`AppShell.tsx`):** Top navigation bar, instant Light/Dark theme switching via CSS Custom Properties, and the global **Token X-Ray Mode** state.
* **Interactive Component Workbench (`WorkbenchView.tsx`):** Split-pane layout (65% Interactive Stage / 35% Live Inspector Panel).
* **Enterprise B2B Context Framing:** Default component copy and scenarios updated to universal B2B workflows:
  * `EditEntryPanel`: *"Edit System Record & Access Permissions"* (Fields: *Record ID*, *Assigned Role*, *Security Clearance*, *Environment Status*).
  * `LoginPage` & `SignUpPage`: *"Enterprise Workspace SSO & Provisioning"*.

#### User Stories & Acceptance Criteria (Phase 1)
* **US 1.1 (UX / Design System Lead):** *As a Design Leader, I want to inspect all interactive states (`default`, `hover`, `focus-visible`, `error`, `disabled`) and accessibility properties of a component on one screen.*
  * **AC 1:** The right-hand Inspector Panel allows interactive prop switching and **State Pinning** (locking `:hover`, `:focus-visible`, or `error` states without holding the mouse).
  * **AC 2:** Each inspected component displays live ARIA role verification, keyboard focus-order badges, and contrast compliance.
* **US 1.2 (Staff Design Engineer):** *As an Engineer, I want to hover over any rendered element in the `EditEntryPanel` and immediately see which semantic W3C tokens power its styling.*
  * **AC 1:** Activating **Token X-Ray Mode** displays a precision blueprint overlay on hover, revealing the semantic token path (e.g., `color.surface.interactive.hover` → `var(--ds-color-surface-interactive-hover)`).
  * **AC 2:** Switching between Light and Dark mode updates all tokens cleanly with zero layout shift (CLS = 0).

---

### Phase 2: The Agentic UI Lab (The Unfair Advantage)
**Objective:** Merge branch `a2ui-experiment` into `main` and build `AgenticLabView.tsx`—an interactive, client-side validation environment that visually proves how your system prevents LLM UI hallucinations.

#### Deliverables
* **Scenario Selector (`fixtures.ts`):** Three selectable B2B agent prompts:
  1. *Prompt A:* "Generate an Enterprise Record Configuration Panel (`EditEntryPanel`)."
  2. *Prompt B:* "Generate a Zero-Trust Workspace Login (`LoginPage`)."
  3. *Prompt C:* "Generate a Critical Form Validation Group (`FormField` + `Input` + `Button`)."
* **3-Column Lab Interface (`AgenticLabView.tsx`):**
  * **Column 1: Agent Contract (`catalog.api.ts`):** Displays the strict TypeScript/JSON schema provided to the coding agent (allowed components, required props, forbidden inline styles).
  * **Column 2: Comparative Stage:** Interactive toggle/slider switching between:
    * *0% – Raw LLM Output (Ungoverned):* Renders hallucinated UI with off-scale spacing (`13px`), hardcoded hex colors (`#ef4444`), raw `<input>` without `FormField`, and broken button hierarchy.
    * *50% – Diagnostic Audit Overlay (`check.ts` Active):* Highlights every violation directly on the UI canvas with red bounding boxes and rule IDs.
    * *100% – Auto-Remediated Agentic UI:* Renders the 100% compliant React component tree using strict semantic tokens.
  * **Column 3: Live Diagnostic Report (`check.ts` Output):** Real-time scorecard displaying `Token Compliance %`, `Catalog API Match`, and a clickable list of violations with auto-fix diffs.
* **Interactive Rule Mutator (Sandbox):** Quick-action buttons allowing visitors to inject errors into the valid payload (`[+ Inject Rogue Hex Color]`, `[+ Break 8px Spacing Grid]`, `[+ Strip FormField Label]`) and watch `check.ts` immediately fail the audit and highlight the offending DOM node.

#### User Stories & Acceptance Criteria (Phase 2)
* **US 2.1 (AI Product Lead / Principal Engineer):** *As an AI Product Leader, I want to see how the design system acts as a deterministic guardrail for LLM-generated interfaces.*
  * **AC 1:** Switching between *Ungoverned* and *Guardrailed* modes dynamically recalculates the output of `check.ts` in the browser and animates the compliance score from `< 50%` to `100%`.
  * **AC 2:** Clicking any violation in the Diagnostic Report highlights the corresponding rule in `catalog.api.ts` and shows the exact W3C token remediation.

---

### Phase 3: W3C DTCG Token Deep-Dive & Developer Export
**Objective:** Prove deep architectural mastery of `design.json`, Style Dictionary pipelines, and enterprise accessibility governance.

#### Deliverables
* **Interactive Taxonomy Explorer (`TokenView.tsx`):** Faceted search and click-to-filter across the `Category.Subcategory.Role.State` structure.
* **Alias Traceability Visualizer:** Visual flow showing how a Primitive Token (e.g., `palette.blue.600`) maps to a Semantic Token (`color.action.primary.default`) and binds to a Component Property (`Button.background`).
* **Live WCAG 2.1 (AA/AAA) & APCA Contrast Matrix:** Client-side contrast calculator validating text and border tokens against surface tokens across Light and Dark modes.
* **Multi-Target Export Drawer:** One-click copy drawer showing any selected token set in four synchronized formats:
  1. **W3C DTCG Standard JSON** (`$value`, `$type`, `$description`)
  2. **CSS Custom Properties** (Style Dictionary / Tailwind v4 output)
  3. **TypeScript Union Types** (Strict prop types)
  4. **Agent System Prompt Manifest** (Compact token rules optimized for LLM context windows)

---

### Phase 4: Executive Polish, Storytelling & Go-To-Market
**Objective:** Maximize conversion for Senior/Staff/Lead applications by optimizing the showcase for time-constrained decision-makers.

#### Deliverables
* **In-App Role-Based Guided Tours:** Header dropdown offering two curated 90-second interactive walkthroughs:
  * **Tour A: For Design & Product Leaders** (Focus: UX consistency, accessibility guarantees, state completeness, design-to-dev velocity).
  * **Tour B: For Staff Engineers & Tech Leads** (Focus: W3C DTCG pipeline, React 19 + Tailwind v4 architecture, `catalog.api.ts` type contracts, deterministic `check.ts` AST/schema validation).
* **Architecture & Executive Specs View (`SpecsView.tsx`):** Visual Mermaid/SVG pipeline diagram (`design.json` → `Style Dictionary` → `React 19 Components` → `catalog.api.ts` → `check.ts`), key ADRs, and direct links to Andreas Keim’s LinkedIn, GitHub, and CV.
* **GitHub `README.md` & LinkedIn Launch Assets:** High-impact repository documentation and a scripted 90-second screen recording demonstrating the Token X-Ray and Agentic UI Lab.

---

## 6. Screen & Layout Specification (UX/UI Blueprint)

### Visual Design Direction: "Swiss Precision Engineering"
* **Chrome vs. Canvas Separation:** The application shell uses a restrained, high-contrast monochrome palette (Slate/Zinc with crisp `1px` borders) so that the inspected Design System components and the semantic diagnostic badges (Emerald Green for Valid, Amber for Warning, Crimson for Violation) stand out with maximum clarity.
* **Typography:** Clean geometric sans-serif (`Inter` or `Geist`) for UI controls, paired with a sharp monospace font (`Geist Mono` or `JetBrains Mono`) for token paths, hex values, contrast ratios, and `check.ts` audit logs.

### Wireframe Blueprint (Main Workbench & Agentic Lab)

```text
+----------------------------------------------------------------------------------------------------+
| [Logo] AGENTIC DS // Andreas Keim      [1. Workbench] [2. Agentic Lab] [3. W3C Tokens] [4. Specs]  |
|                                                          [X-Ray: ON] [Theme: Dark] [Guided Tour v] |
+----------------------------------------------------------------------------------------------------+
| HERO / SYSTEM STATUS BAR                                                                           |
| > W3C DTCG v1.0 | Core Components: 6 | Domain: Enterprise B2B | A2UI Validator: PASS (100% Strict) |
+----------------------------------------------------------------------------------------------------+
|                                                         |                                          |
|  INTERACTIVE STAGE (65% Width)                          |  LIVE INSPECTOR & DIAGNOSTICS (35%)      |
|  +---------------------------------------------------+  |  +------------------------------------+  |
|  | [Pattern: EditEntryPanel v] [Mode: Guardrailed v] |  |  | [Tab: Props/State] [Tokens] [A2UI] |  |
|  |                                                   |  |  +------------------------------------+  |
|  |   +-------------------------------------------+   |  |  | ACTIVE TARGET: EditEntryPanel      |  |
|  |   | Edit System Record & Permissions          |   |  |  |                                    |  |
|  |   | ----------------------------------------- |   |  |  | PINNED STATE: :focus-visible       |  |
|  |   | FormField: Record Identifier *            |   |  |  | [Default] [Hover] [Focus] [Error]  |  |
|  |   | [ Input: SYS-REC-84920                 ]  |   |  |  |                                    |  |
|  |   |   ^-- [X-RAY: color.border.input.focus]   |   |  |  | CONSUMED W3C SEMANTIC TOKENS:      |  |
|  |   |                                           |   |  |  | • color.surface.panel.default      |  |
|  |   | FormField: Security Clearance             |   |  |  | • space.layout.padding.md (16px)   |  |
|  |   | [ Input: Level 3 - Restricted          ]  |   |  |  | • color.border.interactive.focus   |  |
|  |   |                                           |   |  |  |                                    |  |
|  |   | [ Cancel (Secondary) ]  [ Save (Primary)] |   |  |  | DETERMINISTIC AUDIT (check.ts):    |  |
|  |   +-------------------------------------------+   |  |  | [✓] Token Strictness: 100%         |  |
|  |                                                   |  |  | [✓] Catalog API Contract: Valid    |  |
|  | [ Viewport: Desktop | Grid: 8px | Contrast: AAA ] |  |  | [✓] A11y Labels & Contrast: PASS   |  |
|  +---------------------------------------------------+  |  +------------------------------------+  |
+----------------------------------------------------------------------------------------------------+
```

### Signature High-Craft Micro-Interactions
1. **Bidirectional Token X-Ray Loupe:** Hovering over any sub-element inside `EditEntryPanel`, `LoginPage`, or `Button` draws a precision laser border around the element with a floating token pill, while simultaneously highlighting and auto-scrolling to that exact token in the right-hand Inspector Panel.
2. **Real-Time Guardrail Morphing:** In the Agentic UI Lab, toggling from *Ungoverned LLM* to *Guardrailed Mode* smoothly animates the compliance score counter from `42%` to `100%` while transforming red violation badges (`❌ Hardcoded #3B82F6`) into green verified token badges (`✓ color.action.primary.default`).
3. **Zero-Latency State Pinning:** Clicking a pseudo-state pill (`:hover`, `:focus-visible`, `error`, `disabled`) in the Inspector locks the rendered component into that visual state on the canvas so reviewers can inspect focus rings and error tokens effortlessly.
4. **Command Palette (`Cmd + K`):** Instant keyboard navigation to switch views, toggle X-Ray mode, flip Light/Dark themes, run the A2UI validator stress-test, or copy W3C token JSON.

---

## 7. Implementation Execution Checklist (For Coding Agent / Antigravity)

Use this sequential checklist to execute the roadmap inside the repository:

- [ ] **Step 1 (Branch Consolidation):** Merge or copy `a2ui-experiment` files (`catalog.api.ts`, `check.ts`, `fixtures.ts`) into `src/a2ui/` on `main` and ensure `check.ts` exports a pure, browser-safe validation function.
- [ ] **Step 2 (B2B Domain Framing):** Update default props and fixture payloads for `EditEntryPanel`, `LoginPage`, `SignUpPage`, `FormField`, `Input`, and `Button` to use the universal *"Enterprise System & Access Configuration"* copy.
- [ ] **Step 3 (AppShell & Theme/X-Ray Context):** Build `src/showcase/AppShell.tsx` with global state providers for `theme` (`light` | `dark`), `xrayMode` (`boolean`), and `activeTab` (`workbench` | `agentic-lab` | `tokens` | `specs`).
- [ ] **Step 4 (Phase 1 – Component Workbench):** Build `src/showcase/WorkbenchView.tsx` featuring the interactive component stage, state pinning controls, and bidirectional Token X-Ray inspector.
- [ ] **Step 5 (Phase 2 – Agentic UI Lab):** Build `src/showcase/AgenticLabView.tsx` wiring up `fixtures.ts`, `catalog.api.ts`, and `check.ts` with the 3-stage Guardrail Enforcement switch and the interactive Rule Mutator buttons.
- [x] **Step 6 (Phase 3 – W3C Token Explorer):** Build `src/showcase/TokenView.tsx` rendering the `design.json` taxonomy table, alias mapping, WCAG contrast badges, and the 4-format developer export drawer.
- [ ] **Step 7 (Phase 4 – Architecture Specs & Guided Tour):** Build `src/showcase/SpecsView.tsx` and the Role-Based Guided Tour overlay, verify zero TypeScript/build warnings (`npm run build`), and deploy to Vercel via `main`.
