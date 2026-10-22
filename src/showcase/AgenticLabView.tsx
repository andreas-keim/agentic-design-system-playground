import { useState, useMemo } from "react"
import {
  ShieldCheck,
  AlertTriangle,
  Bug,
  CheckCircle2,
  XCircle,
  Sparkles,
  Zap,
  ArrowRight,
  Code2,
  FileCheck,
} from "lucide-react"

import { useShowcase } from "./ShowcaseContext"
import { Button } from "@/components/ui/button"
import { FormField } from "@/components/ui/form-field"
import { EditEntryPanel } from "@/components/edit-entry-panel"
import { LoginPage } from "@/components/login-page"

type StageMode = "0-raw" | "50-audit" | "100-guardrailed"
type Scenario = "record-panel" | "sso-login" | "form-group"

interface SabotageState {
  rogueHex: boolean
  breakGrid: boolean
  stripLabel: boolean
  duplicatePrimary: boolean
}

export function AgenticLabView() {
  const { xrayMode } = useShowcase()

  // Scenario selection
  const [selectedScenario, setSelectedScenario] = useState<Scenario>("record-panel")

  // Stage mode (0% Raw starts as selected by user preference)
  const [stageMode, setStageMode] = useState<StageMode>("0-raw")

  // Interactive Sabotage / Rule Mutator state
  const [sabotage, setSabotage] = useState<SabotageState>({
    rogueHex: true,
    breakGrid: true,
    stripLabel: true,
    duplicatePrimary: true,
  })

  // Selected violation to inspect in detail
  const [selectedViolationId, setSelectedViolationId] = useState<string | null>("rogue-hex")

  // Toggle single sabotage switch
  function toggleSabotage(key: keyof SabotageState) {
    setSabotage((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  // Active violations list derived dynamically
  const activeViolations = useMemo(() => {
    // In 100% Guardrailed mode with no manual overrides, 0 violations
    if (stageMode === "100-guardrailed" && !Object.values(sabotage).some(Boolean)) {
      return []
    }

    const list = []

    if (sabotage.rogueHex || stageMode === "0-raw" || stageMode === "50-audit") {
      list.push({
        id: "rogue-hex",
        ruleId: "RULE-03: Hardcoded Color Token Bypass",
        category: "Token Architecture",
        severity: "critical" as const,
        offendingNode: "<button style='background-color: #ef4444'>",
        description: "Agent attempted to inject arbitrary inline hex code instead of using semantic token role.",
        why: "Direct hex values bypass dark mode switching, theme inheritance, and WCAG contrast guarantees.",
        fix: "Bind to semantic token `color.surface.interactive.hover` via `variant='primary'` or `variant='destructive'`.",
      })
    }

    if (sabotage.breakGrid || stageMode === "0-raw" || stageMode === "50-audit") {
      list.push({
        id: "break-grid",
        ruleId: "GRID-01: Off-Scale Spacing Grid Violation",
        category: "Layout Governance",
        severity: "warning" as const,
        offendingNode: "style='margin-top: 13px; padding-left: 7px;'",
        description: "Agent generated arbitrary 13px spacing, breaking the canonical 8px DTCG scale.",
        why: "Sub-pixel rounding errors and visual jitter occur when agents invent spacing outside the system.",
        fix: "Use DTCG spacing token `--space-component-md` (16px) or `--space-layout-sm` (8px).",
      })
    }

    if (sabotage.stripLabel || stageMode === "0-raw" || stageMode === "50-audit") {
      list.push({
        id: "strip-label",
        ruleId: "A11Y-01: Unlabeled Input Element",
        category: "Accessibility (WCAG 2.2)",
        severity: "critical" as const,
        offendingNode: "<input placeholder='Enter record clearance...' />",
        description: "Naked input element without accessible label or programmatic for/id binding.",
        why: "Screen readers announce 'Unlabeled Edit Text'. Complete failure under WCAG Section 3.3.2.",
        fix: "Enforce `FormField` component with mandatory string `label` prop.",
      })
    }

    if (sabotage.duplicatePrimary || stageMode === "0-raw" || stageMode === "50-audit") {
      list.push({
        id: "duplicate-primary",
        ruleId: "HIERARCHY-02: Conflicting Primary Actions",
        category: "Behavioral Guardrail",
        severity: "warning" as const,
        offendingNode: "<Button variant='primary'>Confirm</Button> + <Button variant='primary'>Save</Button>",
        description: "Agent rendered two primary action buttons on the same surface.",
        why: "Two simultaneous high-salience actions create decision paralysis and break user hierarchy.",
        fix: "Demote secondary action to `variant='outline'` or `variant='ghost'`.",
      })
    }

    return list
  }, [sabotage, stageMode])

  // Calculate live health compliance score
  const healthScore = useMemo(() => {
    if (stageMode === "100-guardrailed") {
      const activeCount = Object.values(sabotage).filter(Boolean).length
      if (activeCount === 0) return 100
      return Math.max(25, 100 - activeCount * 22)
    }
    if (stageMode === "50-audit") return 50
    // 0-raw
    return Math.max(15, 38 - (Object.values(sabotage).filter(Boolean).length - 4) * 8)
  }, [stageMode, sabotage])

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      {/* Top Banner: Scenario Selector & System Heartbeat */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-border/80 bg-card p-5 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold text-primary font-mono uppercase tracking-wide">
              <Zap className="h-3 w-3" />
              Phase 2 • Agentic UI Lab
            </span>
            <span className="font-mono text-xs text-muted-foreground">
              Deterministic AST Guardrails
            </span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            LLM Hallucination Stress Test &amp; Token Validator
          </h1>
        </div>

        {/* Scenario Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground font-mono hidden md:inline">
            Agent Scenario:
          </span>
          <div className="inline-flex rounded-lg bg-muted/80 p-0.5 border border-border/60">
            {[
              { id: "record-panel", label: "Enterprise Record" },
              { id: "sso-login", label: "SSO Login" },
              { id: "form-group", label: "Access Form" },
            ].map((s) => (
              <button
                key={s.id}
                onClick={() => setSelectedScenario(s.id as Scenario)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
                  selectedScenario === s.id
                    ? "bg-card text-foreground shadow-xs font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main 3-Column Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* ========================================================================= */}
        {/* COLUMN 1: Agent Contract (catalog.api.ts & Zod Guardrails) [3 Cols]     */}
        {/* ========================================================================= */}
        <div className="lg:col-span-3 flex flex-col gap-5 rounded-2xl border border-border/80 bg-card p-5 shadow-xs">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-mono text-[11px] font-semibold text-primary uppercase tracking-wider flex items-center gap-1.5">
                <Code2 className="h-3.5 w-3.5" />
                Column 1 • Schema Contract
              </span>
              <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                catalog.api.ts
              </span>
            </div>
            <h2 className="text-sm font-bold text-foreground">
              Allowed Agent Primitives
            </h2>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              Coding agents query this strict AST schema. Raw HTML tags and inline CSS are strictly blocked at parse time.
            </p>
          </div>

          {/* Component Allowlist */}
          <div className="space-y-2">
            <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              Allowed Catalog API:
            </span>
            <div className="space-y-1.5 font-mono text-xs">
              <div className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/40 px-2.5 py-1.5">
                <span className="font-medium text-foreground">&lt;Headline /&gt;</span>
                <span className="text-[10px] text-emerald-500 font-semibold">Strict 1 per view</span>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/40 px-2.5 py-1.5">
                <span className="font-medium text-foreground">&lt;FormField /&gt;</span>
                <span className="text-[10px] text-blue-500 font-semibold">Required: label</span>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/40 px-2.5 py-1.5">
                <span className="font-medium text-foreground">&lt;Button /&gt;</span>
                <span className="text-[10px] text-amber-500 font-semibold">Max 1 primary</span>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/40 px-2.5 py-1.5">
                <span className="font-medium text-foreground">&lt;Column /&gt;</span>
                <span className="text-[10px] text-purple-500 font-semibold">Strict 8px grid</span>
              </div>
            </div>
          </div>

          {/* Hard Guardrails Summary */}
          <div className="rounded-xl border border-border/60 bg-muted/30 p-3 space-y-2">
            <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground block font-semibold">
              Deterministic AST Rules:
            </span>
            <ul className="space-y-1 text-xs text-muted-foreground font-mono">
              <li className="flex items-start gap-1.5">
                <XCircle className="h-3.5 w-3.5 text-rose-500 shrink-0 mt-0.5" />
                <span>className prop forbidden</span>
              </li>
              <li className="flex items-start gap-1.5">
                <XCircle className="h-3.5 w-3.5 text-rose-500 shrink-0 mt-0.5" />
                <span>Raw hex (#ef4444) blocked</span>
              </li>
              <li className="flex items-start gap-1.5">
                <XCircle className="h-3.5 w-3.5 text-rose-500 shrink-0 mt-0.5" />
                <span>13px off-grid rejected</span>
              </li>
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                <span>W3C DTCG Token Mapping</span>
              </li>
            </ul>
          </div>

          {/* Prompt Briefing Snippet */}
          <div className="rounded-xl bg-black/90 p-3 text-[11px] font-mono text-zinc-300 border border-zinc-800">
            <span className="text-[10px] text-zinc-500 uppercase tracking-wider block mb-1">
              Agent Prompt (Live):
            </span>
            <p className="text-zinc-200 leading-snug">
              {selectedScenario === "record-panel" &&
                '"Generate an enterprise record configuration card with clearance levels and delete action."'}
              {selectedScenario === "sso-login" &&
                '"Generate an enterprise zero-trust SSO login panel with secure email and credential handling."'}
              {selectedScenario === "form-group" &&
                '"Generate a role authorization form with primary submit CTA and accessible helper hints."'}
            </p>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* COLUMN 2: Comparative Stage (0% Raw vs 50% Audit vs 100% Guardrailed) [5 Cols] */}
        {/* ========================================================================= */}
        <div className="lg:col-span-5 flex flex-col rounded-2xl border border-border/80 bg-card shadow-xs overflow-hidden">
          
          {/* Stage Header & Segmented Controller */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border/60 p-4 bg-card gap-3">
            <div>
              <span className="font-mono text-[11px] font-semibold text-primary uppercase tracking-wider block">
                Column 2 • Comparative Stage
              </span>
              <span className="text-xs text-muted-foreground font-mono">
                {stageMode === "0-raw" && "0% Ungoverned LLM Output"}
                {stageMode === "50-audit" && "50% Diagnostic Audit Overlay"}
                {stageMode === "100-guardrailed" && "100% W3C Guardrailed UI"}
              </span>
            </div>

            {/* 3-State Apple-Style Segmented Slider */}
            <div className="inline-flex rounded-lg bg-muted/80 p-0.5 border border-border/60">
              <button
                onClick={() => setStageMode("0-raw")}
                className={`rounded-md px-2.5 py-1 text-xs font-mono font-medium transition-all ${
                  stageMode === "0-raw"
                    ? "bg-rose-500/15 text-rose-600 dark:text-rose-400 font-bold shadow-xs border border-rose-500/30"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                0% Raw
              </button>
              <button
                onClick={() => setStageMode("50-audit")}
                className={`rounded-md px-2.5 py-1 text-xs font-mono font-medium transition-all ${
                  stageMode === "50-audit"
                    ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 font-bold shadow-xs border border-amber-500/30"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                50% Audit
              </button>
              <button
                onClick={() => {
                  setStageMode("100-guardrailed")
                  // Auto-resolve sabotages on clicking 100%
                  setSabotage({
                    rogueHex: false,
                    breakGrid: false,
                    stripLabel: false,
                    duplicatePrimary: false,
                  })
                }}
                className={`rounded-md px-2.5 py-1 text-xs font-mono font-medium transition-all ${
                  stageMode === "100-guardrailed"
                    ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold shadow-xs border border-emerald-500/30"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                100% Guarded
              </button>
            </div>
          </div>

          {/* Visual Canvas */}
          <div className="relative min-h-[460px] p-6 sm:p-8 flex flex-col items-center justify-center bg-muted/20 dark:bg-muted/10">
            
            {/* STAGE 0%: RAW UNGOVERNED LLM OUTPUT */}
            {stageMode === "0-raw" && (
              <div className="w-full max-w-sm flex flex-col gap-4">
                {/* Hallucinated Raw Container */}
                <div
                  className="rounded-lg p-5 border shadow-sm transition-all bg-card"
                  style={{
                    // Broken 13px asymmetric margin injected by LLM
                    marginTop: "13px",
                    borderColor: "#ef4444",
                    boxShadow: "0 0 0 1px #ef4444",
                  }}
                >
                  <div className="flex items-center justify-between pb-3 border-b border-rose-500/30 mb-3">
                    <span className="font-sans text-xs text-rose-500 font-bold tracking-tight uppercase">
                      ⚠️ Ungoverned LLM Hallucination
                    </span>
                    <span className="font-mono text-[10px] bg-rose-500/10 text-rose-500 px-1.5 py-0.5 rounded">
                      No Tokens Bound
                    </span>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <span className="text-sm font-semibold text-foreground block">
                        Cluster Security Clearance
                      </span>
                      {/* Naked input tag with no aria-label, no FormField wrapper */}
                      <input
                        type="text"
                        defaultValue="SYS-REC-84920 (Cluster Security Officer)"
                        className="mt-1 w-full rounded border border-zinc-400 dark:border-zinc-700 bg-background px-3 py-2 text-xs text-foreground outline-none"
                        style={{ fontSize: "11px" }}
                      />
                      <span className="text-[10px] text-zinc-500 mt-0.5 block">
                        (Raw &lt;input&gt; tag with zero accessibility binding)
                      </span>
                    </div>

                    {/* Conflicting buttons with hardcoded rogue hex styles */}
                    <div className="pt-2 flex items-center gap-2">
                      <button
                        type="button"
                        className="px-3 py-2 text-xs font-semibold rounded text-white shadow-xs"
                        style={{ backgroundColor: "#ef4444" }}
                      >
                        Confirm (Primary)
                      </button>
                      <button
                        type="button"
                        className="px-3 py-2 text-xs font-semibold rounded text-white shadow-xs"
                        style={{ backgroundColor: "#6d28d9" }}
                      >
                        Save Changes (Primary)
                      </button>
                    </div>
                  </div>
                </div>

                {/* Big Promotional CTA to Apply Guardrails */}
                <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 text-center">
                  <p className="text-xs text-muted-foreground mb-3 font-medium">
                    Raw LLMs break brand tokens, accessibility, and button hierarchies.
                  </p>
                  <Button
                    variant="primary"
                    className="w-full gap-2 shadow-sm font-semibold"
                    onClick={() => {
                      setStageMode("100-guardrailed")
                      setSabotage({
                        rogueHex: false,
                        breakGrid: false,
                        stripLabel: false,
                        duplicatePrimary: false,
                      })
                    }}
                  >
                    <ShieldCheck className="h-4 w-4" />
                    Apply Guardrails (➔ 100%)
                  </Button>
                </div>
              </div>
            )}

            {/* STAGE 50%: DIAGNOSTIC AUDIT OVERLAY (check.ts active) */}
            {stageMode === "50-audit" && (
              <div className="w-full max-w-sm flex flex-col gap-4">
                <div className="relative rounded-lg p-5 border-2 border-dashed border-rose-500 bg-card shadow-sm">
                  {/* Floating Violation Badge 1: 13px Grid */}
                  <div className="absolute -top-3.5 left-4 z-20 rounded bg-rose-600 text-white font-mono text-[9px] px-2 py-0.5 shadow-sm font-semibold flex items-center gap-1">
                    <Bug className="h-2.5 w-2.5" />
                    GRID-01: 13px != 8px scale
                  </div>

                  <div className="space-y-4 pt-1">
                    {/* Floating Violation Badge 2: Naked Input */}
                    <div className="relative rounded border-2 border-dashed border-amber-500 p-2">
                      <div className="absolute -top-3 right-2 z-20 rounded bg-amber-600 text-white font-mono text-[9px] px-2 py-0.5 shadow-sm font-semibold">
                        A11Y-01: Missing &lt;FormField label&gt;
                      </div>
                      <input
                        type="text"
                        defaultValue="SYS-REC-84920 (Cluster Security Officer)"
                        className="w-full rounded border border-zinc-400 bg-background px-3 py-1.5 text-xs text-foreground"
                      />
                    </div>

                    {/* Floating Violation Badge 3: Duplicate Primary & Rogue Hex */}
                    <div className="relative rounded border-2 border-dashed border-rose-500 p-2">
                      <div className="absolute -top-3 right-2 z-20 rounded bg-rose-600 text-white font-mono text-[9px] px-2 py-0.5 shadow-sm font-semibold">
                        RULE-03: Hardcoded #ef4444
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          className="px-3 py-2 text-xs font-semibold rounded text-white"
                          style={{ backgroundColor: "#ef4444" }}
                        >
                          Confirm
                        </button>
                        <button
                          type="button"
                          className="px-3 py-2 text-xs font-semibold rounded text-white"
                          style={{ backgroundColor: "#6d28d9" }}
                        >
                          Save Changes
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between px-2 text-xs font-mono text-muted-foreground">
                  <span className="flex items-center gap-1 text-rose-500 font-semibold">
                    <XCircle className="h-3.5 w-3.5" />
                    4 AST Violations Detected
                  </span>
                  <button
                    onClick={() => {
                      setStageMode("100-guardrailed")
                      setSabotage({
                        rogueHex: false,
                        breakGrid: false,
                        stripLabel: false,
                        duplicatePrimary: false,
                      })
                    }}
                    className="text-primary hover:underline font-semibold flex items-center gap-1"
                  >
                    Auto-Remediate
                    <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
              </div>
            )}

            {/* STAGE 100%: 100% GUARDRAILED & REMEDIATED */}
            {stageMode === "100-guardrailed" && (
              <div className="w-full max-w-md">
                <div className="relative">
                  {xrayMode && (
                    <span className="absolute -top-3.5 right-2 z-30 rounded bg-emerald-600 text-white font-mono text-[9px] px-2 py-0.5 shadow-xs pointer-events-none">
                      W3C DTCG Token Contract Enforced
                    </span>
                  )}

                  {selectedScenario === "record-panel" && (
                    <EditEntryPanel
                      value="SYS-REC-84920 (Cluster Security Officer // Level 3 Restricted)"
                      onSave={() => alert("Record saved via governed contract.")}
                      onCancel={() => {}}
                      onDelete={() => {}}
                      title="System Access & Role Configuration"
                      inputLabel="Record Identifier & Clearance Level"
                      deleteLabel="Delete Record"
                      cancelLabel="Cancel"
                      saveLabel="Save Changes"
                    />
                  )}

                  {selectedScenario === "sso-login" && (
                    <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-sm">
                      <LoginPage
                        onSubmit={({ email }) => {
                          alert(`Governed login for: ${email}`)
                        }}
                      />
                    </div>
                  )}

                  {selectedScenario === "form-group" && (
                    <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-sm flex flex-col gap-4">
                      <h3 className="text-base font-bold text-foreground">
                        User Role Assignment
                      </h3>
                      <FormField
                        label="Identity Subject"
                        defaultValue="andreas.keim@enterprise-cluster.local"
                      />
                      <FormField
                        label="Access Key Passphrase"
                        type="password"
                        defaultValue="guardrailed-secret"
                      />
                      <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/50">
                        <Button variant="outline">Dismiss</Button>
                        <Button variant="primary">Grant Access</Button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Compliance Badge */}
                <div className="mt-4 flex items-center justify-center gap-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-mono">
                  <ShieldCheck className="h-4 w-4" />
                  <span>100% Deterministic AST Compliance (<code className="font-bold">check.ts</code> passed)</span>
                </div>
              </div>
            )}

          </div>

          {/* Stage Footer: System Specs */}
          <div className="border-t border-border/60 px-5 py-3 bg-muted/10 flex items-center justify-between text-xs text-muted-foreground font-mono">
            <span>AST Parse Engine: v0.12 Pure Client</span>
            <span className="flex items-center gap-1.5 text-foreground font-semibold">
              <Sparkles className="h-3 w-3 text-primary" />
              Zero Network Latency
            </span>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* COLUMN 3: Live Scorecard & Interactive Rule Mutator [4 Cols]            */}
        {/* ========================================================================= */}
        <div className="lg:col-span-4 flex flex-col gap-5 rounded-2xl border border-border/80 bg-card p-5 shadow-xs">
          
          {/* Header */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-mono text-[11px] font-semibold text-primary uppercase tracking-wider flex items-center gap-1.5">
                <FileCheck className="h-3.5 w-3.5" />
                Column 3 • Live Diagnostics
              </span>
              <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                check.ts Output
              </span>
            </div>
            <h2 className="text-sm font-bold text-foreground">
              AST Health Scorecard
            </h2>
          </div>

          {/* Big Scorecard Metrics Card */}
          <div className="rounded-xl border border-border/80 bg-muted/20 p-4">
            <div className="flex items-end justify-between">
              <div>
                <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider block">
                  Token Compliance
                </span>
                <span
                  className={`text-4xl font-extrabold tracking-tight font-mono ${
                    healthScore === 100
                      ? "text-emerald-500"
                      : healthScore >= 50
                      ? "text-amber-500"
                      : "text-rose-500"
                  }`}
                >
                  {healthScore}%
                </span>
              </div>
              <div className="text-right">
                <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider block">
                  AST Latency
                </span>
                <span className="font-mono text-sm font-bold text-foreground flex items-center justify-end gap-1">
                  <Zap className="h-3 w-3 text-emerald-500" />
                  &lt; 1.8 ms
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-3 h-2 w-full rounded-full bg-muted overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  healthScore === 100
                    ? "bg-emerald-500"
                    : healthScore >= 50
                    ? "bg-amber-500"
                    : "bg-rose-500"
                }`}
                style={{ width: `${healthScore}%` }}
              />
            </div>

            <div className="mt-3 flex items-center justify-between text-[11px] font-mono">
              <span className="text-muted-foreground">Catalog Match:</span>
              <span className="font-semibold text-foreground">
                {activeViolations.length === 0 ? "PASSED (Production)" : "REJECTED (Violations)"}
              </span>
            </div>
          </div>

          {/* Interactive Rule Mutator (Sabotage Pills) */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-1">
                <Bug className="h-3 w-3 text-rose-500" />
                Interactive Rule Mutator:
              </span>
              <span className="text-[10px] text-muted-foreground font-mono">
                Click to inject
              </span>
            </div>

            {/* Mutator Action Pills */}
            <div className="flex flex-wrap gap-1.5 font-mono text-[11px]">
              <button
                onClick={() => toggleSabotage("rogueHex")}
                className={`rounded-lg px-2.5 py-1 transition-all border ${
                  sabotage.rogueHex
                    ? "bg-rose-500/15 border-rose-500/30 text-rose-600 dark:text-rose-400 font-semibold shadow-xs"
                    : "bg-muted/40 border-border/60 text-muted-foreground hover:text-foreground"
                }`}
              >
                {sabotage.rogueHex ? "[- Rogue Hex]" : "[+ Rogue Hex]"}
              </button>

              <button
                onClick={() => toggleSabotage("breakGrid")}
                className={`rounded-lg px-2.5 py-1 transition-all border ${
                  sabotage.breakGrid
                    ? "bg-amber-500/15 border-amber-500/30 text-amber-600 dark:text-amber-400 font-semibold shadow-xs"
                    : "bg-muted/40 border-border/60 text-muted-foreground hover:text-foreground"
                }`}
              >
                {sabotage.breakGrid ? "[- Break Grid 13px]" : "[+ Break Grid 13px]"}
              </button>

              <button
                onClick={() => toggleSabotage("stripLabel")}
                className={`rounded-lg px-2.5 py-1 transition-all border ${
                  sabotage.stripLabel
                    ? "bg-rose-500/15 border-rose-500/30 text-rose-600 dark:text-rose-400 font-semibold shadow-xs"
                    : "bg-muted/40 border-border/60 text-muted-foreground hover:text-foreground"
                }`}
              >
                {sabotage.stripLabel ? "[- Strip A11y Label]" : "[+ Strip A11y Label]"}
              </button>

              <button
                onClick={() => toggleSabotage("duplicatePrimary")}
                className={`rounded-lg px-2.5 py-1 transition-all border ${
                  sabotage.duplicatePrimary
                    ? "bg-purple-500/15 border-purple-500/30 text-purple-600 dark:text-purple-400 font-semibold shadow-xs"
                    : "bg-muted/40 border-border/60 text-muted-foreground hover:text-foreground"
                }`}
              >
                {sabotage.duplicatePrimary ? "[- 2 Primaries]" : "[+ 2 Primaries]"}
              </button>
            </div>
          </div>

          {/* Active Violations Accordion / List */}
          <div className="space-y-2">
            <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground block font-semibold">
              Active AST Violations ({activeViolations.length}):
            </span>

            {activeViolations.length === 0 ? (
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4 text-center">
                <CheckCircle2 className="h-6 w-6 text-emerald-500 mx-auto mb-1.5" />
                <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 font-mono">
                  All AST Rules Satisfied
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Component payload is fully compliant with W3C DTCG tokens.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {activeViolations.map((v) => (
                  <div
                    key={v.id}
                    onClick={() => setSelectedViolationId(v.id)}
                    className={`cursor-pointer rounded-xl border p-3 transition-all ${
                      selectedViolationId === v.id
                        ? "border-primary bg-primary/5 shadow-xs"
                        : "border-border/70 bg-card hover:border-border"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-mono text-xs font-semibold text-foreground flex items-center gap-1.5">
                        <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                        {v.ruleId}
                      </span>
                      <span className="font-mono text-[9px] uppercase px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                        {v.category}
                      </span>
                    </div>

                    <p className="text-xs text-muted-foreground mt-1.5 leading-snug">
                      {v.description}
                    </p>

                    {/* Expanded details when selected */}
                    {selectedViolationId === v.id && (
                      <div className="mt-3 pt-3 border-t border-border/60 space-y-2 text-[11px] font-mono">
                        <div>
                          <span className="text-rose-500 font-bold block mb-0.5">
                            Why rejected:
                          </span>
                          <span className="text-muted-foreground">{v.why}</span>
                        </div>
                        <div className="rounded bg-muted/60 p-2 text-foreground">
                          <span className="text-emerald-500 font-bold block mb-0.5">
                            Deterministic Auto-Fix:
                          </span>
                          <span>{v.fix}</span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  )
}
