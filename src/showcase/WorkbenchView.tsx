import { useState, useMemo } from "react"
import { CheckCircle2 } from "lucide-react"

import { SegmentedTabs } from "./SegmentedTabs"
import { PageHeader } from "./PageHeader"
import { Button } from "@/components/ui/button"
import { FormField } from "@/components/ui/form-field"
import { EditEntryPanel } from "@/components/edit-entry-panel"
import { LoginPage } from "@/components/login-page"

type ActiveComponent = "edit-panel" | "button" | "form-field" | "login-page"
type PinnedState = "default" | "hover" | "focus" | "disabled"

// WCAG 2.1 Contrast Formula
function getRelativeLuminance(hex: string): number {
  const clean = hex.replace("#", "").trim()
  const num = parseInt(clean, 16)
  const [r, g, b] = [(num >> 16) & 255, (num >> 8) & 255, num & 255].map((c) => {
    const s = c / 255
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

function calculateContrast(hex1: string, hex2: string): number {
  const lum1 = getRelativeLuminance(hex1)
  const lum2 = getRelativeLuminance(hex2)
  const lighter = Math.max(lum1, lum2)
  const darker = Math.min(lum1, lum2)
  return (lighter + 0.05) / (darker + 0.05)
}

function evaluateWcagLevel(ratio: number): "WCAG AAA" | "WCAG AA" | "WCAG Large" | "Fail" {
  if (ratio >= 7.0) return "WCAG AAA"
  if (ratio >= 4.5) return "WCAG AA"
  if (ratio >= 3.0) return "WCAG Large"
  return "Fail"
}

interface CalculatedContrastPair {
  role: string
  fg: string
  bg: string
  ratio: number
  level: "WCAG AAA" | "WCAG AA" | "WCAG Large" | "Fail"
}

export function WorkbenchView() {
  const [xrayMode, setXrayMode] = useState<boolean>(false)
  const [activeComponent, setActiveComponent] = useState<ActiveComponent>("edit-panel")
  const [pinnedState, setPinnedState] = useState<PinnedState>("default")

  // Sample Enterprise Record Data
  const [systemRecord, setSystemRecord] = useState<string | null>(
    "SYS-REC-84920 (Cluster Security Officer // Level 3 Restricted)"
  )
  const [recordSavedNotice, setRecordSavedNotice] = useState<string | null>(null)

  // Konkrete, berechnete Farbpaarungen für die aktive Komponente
  const calculatedPairs = useMemo<CalculatedContrastPair[]>(() => {
    const primaryBg = pinnedState === "hover" ? "#5b21b6" : "#6d28d9"
    const primaryRatio = calculateContrast("#ffffff", primaryBg)

    if (activeComponent === "button" || activeComponent === "edit-panel") {
      const destructiveFg = "#b91c1c"
      const destructiveBg = "#fde5e7" // Light-Mode Destructive getönter Hintergrund
      const destructiveRatio = calculateContrast(destructiveFg, destructiveBg)

      return [
        {
          role: pinnedState === "hover" ? "Primary Button (:hover)" : "Primary Button (:default)",
          fg: "#ffffff",
          bg: primaryBg,
          ratio: primaryRatio,
          level: evaluateWcagLevel(primaryRatio),
        },
        {
          role: "Destructive Button",
          fg: destructiveFg,
          bg: destructiveBg,
          ratio: destructiveRatio,
          level: evaluateWcagLevel(destructiveRatio),
        },
      ]
    }

    if (activeComponent === "form-field") {
      const labelFg = "#09090b"
      const canvasBg = "#ffffff"
      const labelRatio = calculateContrast(labelFg, canvasBg)

      const errorFg = "#b91c1c"
      const errorRatio = calculateContrast(errorFg, canvasBg)

      return [
        {
          role: "Form Label & Text",
          fg: labelFg,
          bg: canvasBg,
          ratio: labelRatio,
          level: evaluateWcagLevel(labelRatio),
        },
        {
          role: "Validierungsfehler",
          fg: errorFg,
          bg: canvasBg,
          ratio: errorRatio,
          level: evaluateWcagLevel(errorRatio),
        },
      ]
    }

    // login-page
    const labelFg = "#09090b"
    const canvasBg = "#ffffff"
    const labelRatio = calculateContrast(labelFg, canvasBg)

    return [
      {
        role: "Primary CTA (SSO)",
        fg: "#ffffff",
        bg: primaryBg,
        ratio: primaryRatio,
        level: evaluateWcagLevel(primaryRatio),
      },
      {
        role: "Form Labels",
        fg: labelFg,
        bg: canvasBg,
        ratio: labelRatio,
        level: evaluateWcagLevel(labelRatio),
      },
    ]
  }, [activeComponent, pinnedState])

  function handleSaveRecord(value: string) {
    setSystemRecord(value)
    setRecordSavedNotice("Saved")
    setTimeout(() => setRecordSavedNotice(null), 2500)
  }

  function getSimulatedButtonClass(variant: string) {
    if (pinnedState === "hover") {
      switch (variant) {
        case "primary":
          return "!bg-[var(--color-background-primary-hover)] ring-2 ring-primary/25"
        case "outline":
          return "!bg-muted !text-foreground"
        case "secondary":
          return "!bg-[color-mix(in_oklch,var(--secondary),var(--foreground)_5%)]"
        case "ghost":
          return "!bg-muted !text-foreground"
        case "destructive":
          return "!bg-destructive/20"
        case "link":
          return "underline"
        default:
          return ""
      }
    }
    if (pinnedState === "focus") {
      if (variant === "destructive") {
        return "border-destructive/40 ring-3 ring-destructive/20"
      }
      return "border-ring ring-3 ring-ring/50"
    }
    return ""
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <PageHeader
        title="Interactive Component Stage"
        subtitle="Live states, ARIA verification, and bidirectional W3C token X-Ray inspection."
      />

      {/* 2-Column Clean Workspace: Exact Top Alignment, 2-Tier Surface Hierarchy */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        {/* Left: The Component Stage Card */}
        <div
          className={`lg:col-span-8 rounded-2xl border border-border/80 bg-card shadow-xs flex flex-col overflow-hidden transition-all ${
            xrayMode ? "ring-1 ring-foreground/20" : ""
          }`}
        >
          {/* Stage Header / Toolbar: h-14 für horizontales Divider-Alignment auf Desktop, umbruchsicher auf Mobile */}
          <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-2.5 border-b border-border/60 px-3.5 sm:px-5 py-2.5 sm:py-0 sm:h-14 bg-card shrink-0">
            {/* Apple-Style Segmented Component Selector */}
            <div className="overflow-x-auto scrollbar-none max-w-full">
              <SegmentedTabs<ActiveComponent>
                items={[
                  { id: "edit-panel", label: "Record Panel" },
                  { id: "button", label: "Button Variants" },
                  { id: "form-field", label: "Form Fields" },
                  { id: "login-page", label: "SSO Login" },
                ]}
                value={activeComponent}
                onChange={setActiveComponent}
              />
            </div>

            {/* Token-Namen anzeigen Schalter (ohne Icon, monochrom) */}
            <button
              type="button"
              onClick={() => setXrayMode((prev) => !prev)}
              aria-pressed={xrayMode}
              className={`inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-mono transition-all cursor-pointer shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-1 ${
                xrayMode
                  ? "bg-foreground text-background font-medium shadow-2xs border border-foreground"
                  : "border border-border/80 bg-muted/30 text-muted-foreground hover:text-foreground hover:bg-muted/60"
              }`}
            >
              <span>Token-Namen anzeigen</span>
            </button>
          </div>

          {/* The Viewport Canvas (Subtle Recessed Surface where the Object Lives) */}
          <div className="relative flex-1 min-h-[460px] p-4 sm:p-8 lg:p-12 flex items-center justify-center bg-muted/25 dark:bg-muted/10">
            {/* Subtle Saved Toast */}
            {recordSavedNotice && (
              <div className="absolute top-4 right-4 z-20 flex items-center gap-1.5 rounded-full bg-card border border-border/80 px-3 py-1 text-xs text-foreground font-mono shadow-xs">
                <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                {recordSavedNotice}
              </div>
            )}

            {/* 1. EditEntryPanel View: Pure White Card with Real Elevation */}
            {activeComponent === "edit-panel" && (
              <div className="w-full max-w-lg">
                {systemRecord === null ? (
                  <div className="rounded-xl border border-dashed border-border/80 bg-card p-8 text-center shadow-xs">
                    <p className="text-xs text-muted-foreground mb-3">Record removed from cluster.</p>
                    <Button
                      variant="outline"
                      onClick={() =>
                        setSystemRecord("SYS-REC-84920 (Cluster Security Officer // Level 3 Restricted)")
                      }
                    >
                      Reset Record
                    </Button>
                  </div>
                ) : (
                  <div className="relative">
                    {xrayMode && (
                      <span className="absolute -top-3.5 right-2 z-30 rounded bg-zinc-900 text-zinc-100 dark:bg-zinc-100 dark:text-zinc-900 font-mono text-[9px] px-1.5 py-0.5 shadow-xs border border-zinc-700/40 dark:border-zinc-300/40 pointer-events-none">
                        --color-card • --space-component-md
                      </span>
                    )}
                    <EditEntryPanel
                      value={systemRecord}
                      onSave={handleSaveRecord}
                      onCancel={() => {}}
                      onDelete={() => setSystemRecord(null)}
                      title="System Access & Role Configuration"
                      inputLabel="Record Identifier & Clearance Level"
                      deleteLabel="Delete Record"
                      cancelLabel="Cancel"
                      saveLabel="Save Changes"
                      className={pinnedState === "disabled" ? "opacity-50 pointer-events-none" : ""}
                    />
                  </div>
                )}
              </div>
            )}

            {/* 2. Button View: Floating cleanly on the Canvas */}
            {activeComponent === "button" && (
              <div className="flex flex-col gap-6 items-center w-full max-w-md bg-card p-8 rounded-xl border border-border/80 shadow-xs">
                <div className="flex flex-wrap gap-3 justify-center items-center">
                  <div className="relative">
                    {xrayMode && (
                      <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-30 rounded bg-zinc-900 text-zinc-100 dark:bg-zinc-100 dark:text-zinc-900 font-mono text-[9px] px-1.5 py-0.5 whitespace-nowrap shadow-xs border border-zinc-700/40 dark:border-zinc-300/40 pointer-events-none">
                        --color-background-primary-default
                      </span>
                    )}
                    <Button
                      variant="primary"
                      disabled={pinnedState === "disabled"}
                      className={getSimulatedButtonClass("primary")}
                    >
                      Primary
                    </Button>
                  </div>

                  <Button
                    variant="outline"
                    disabled={pinnedState === "disabled"}
                    className={getSimulatedButtonClass("outline")}
                  >
                    Outline
                  </Button>

                  <Button
                    variant="destructive"
                    disabled={pinnedState === "disabled"}
                    className={getSimulatedButtonClass("destructive")}
                  >
                    Destructive
                  </Button>
                </div>

                <div className="flex flex-wrap gap-2 justify-center items-center pt-2 border-t border-border/50 w-full">
                  <Button
                    variant="secondary"
                    disabled={pinnedState === "disabled"}
                    className={getSimulatedButtonClass("secondary")}
                  >
                    Secondary
                  </Button>
                  <Button
                    variant="ghost"
                    disabled={pinnedState === "disabled"}
                    className={getSimulatedButtonClass("ghost")}
                  >
                    Ghost
                  </Button>
                  <Button
                    variant="link"
                    disabled={pinnedState === "disabled"}
                    className={getSimulatedButtonClass("link")}
                  >
                    Link
                  </Button>
                </div>
              </div>
            )}

            {/* 3. FormField View */}
            {activeComponent === "form-field" && (
              <div className="w-full max-w-sm flex flex-col gap-4 bg-card p-6 rounded-xl border border-border/80 shadow-xs">
                <FormField
                  label="System Identifier"
                  placeholder="e.g. k8s-eu-central-1"
                  defaultValue="k8s-prod-cluster-01"
                  disabled={pinnedState === "disabled"}
                  className={
                    pinnedState === "focus"
                      ? "[&_input]:border-ring [&_input]:ring-3 [&_input]:ring-ring/50"
                      : pinnedState === "hover"
                      ? "[&_input]:border-foreground/50"
                      : ""
                  }
                />

                <FormField
                  label="Access Key Secret"
                  type="password"
                  placeholder="••••••••••••••••"
                  defaultValue="secret-token-value"
                  error={pinnedState === "focus" ? undefined : "Key expires in 2 hours."}
                  disabled={pinnedState === "disabled"}
                  className={
                    pinnedState === "focus"
                      ? "[&_input]:border-ring [&_input]:ring-3 [&_input]:ring-ring/50"
                      : pinnedState === "hover"
                      ? "[&_input]:border-foreground/50"
                      : ""
                  }
                />
              </div>
            )}

            {/* 4. LoginPage View */}
            {activeComponent === "login-page" && (
              <div className="w-full max-w-sm bg-card p-8 rounded-2xl border border-border/90 shadow-sm">
                <LoginPage
                  onSubmit={({ email }) => {
                    alert(`SSO invoked for: ${email}`)
                  }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Right: The Quiet Inspector Panel Card */}
        <div className="lg:col-span-4 rounded-2xl border border-border/80 bg-card overflow-hidden flex flex-col justify-between shadow-xs">
          {/* Header: Exakt h-14 bündig mit linker Stage-Toolbar */}
          <div className="border-b border-border/60 px-6 h-14 flex flex-col justify-center bg-card shrink-0">
            <h3 className="text-xs font-semibold tracking-tight text-foreground leading-tight">
              Component Inspector
            </h3>
            <p className="text-[11px] text-muted-foreground leading-tight mt-0.5">
              Live token bindings & simulated states
            </p>
          </div>

          <div className="p-6 space-y-6">

            {/* Simulated States */}
            <div>
              <span className="text-[11px] font-mono text-muted-foreground block mb-2 uppercase tracking-wider">
                Simulate State
              </span>
              <div className="grid grid-cols-2 gap-1.5 font-mono text-xs">
                {[
                  { id: "default", label: ":default" },
                  { id: "hover", label: ":hover" },
                  { id: "focus", label: ":focus-visible" },
                  { id: "disabled", label: ":disabled" },
                ].map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setPinnedState(s.id as PinnedState)}
                    aria-pressed={pinnedState === s.id}
                    aria-label={`Status ${s.label} simulieren`}
                    className={`rounded-lg border px-2.5 py-1.5 text-left transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
                      pinnedState === s.id
                        ? "border-foreground/30 bg-muted text-foreground font-medium shadow-2xs"
                        : "border-border/60 text-muted-foreground hover:text-foreground hover:bg-muted/40"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tokens */}
            <div className="border-t border-border/60 pt-4">
              <span className="text-[11px] font-mono text-muted-foreground block mb-2 uppercase tracking-wider">
                Active W3C Tokens
              </span>
              <div className="space-y-1.5 font-mono text-xs">
                <div className="flex items-center justify-between py-1 text-muted-foreground">
                  <span className="text-foreground">--color-card</span>
                  <span className="text-[11px]">surface.panel</span>
                </div>
                <div className="flex items-center justify-between py-1 text-muted-foreground">
                  <span className="text-foreground">
                    {pinnedState === "hover"
                      ? "--color-primary-hover"
                      : pinnedState === "focus"
                      ? "--color-ring"
                      : pinnedState === "disabled"
                      ? "--opacity-disabled"
                      : "--color-primary"}
                  </span>
                  <span className="text-[11px] text-purple-600 dark:text-purple-400 font-semibold">
                    {pinnedState === "hover"
                      ? "#5b21b6 (violet-hover)"
                      : pinnedState === "focus"
                      ? "ring-3 (focus-ring)"
                      : pinnedState === "disabled"
                      ? "0.5 (disabled)"
                      : "#6d28d9 (violet)"}
                  </span>
                </div>
                <div className="flex items-center justify-between py-1 text-muted-foreground">
                  <span className="text-foreground">--space-component-md</span>
                  <span className="text-[11px]">16px on-grid</span>
                </div>
                <div className="flex items-center justify-between py-1 text-muted-foreground">
                  <span className="text-foreground">--radii-md</span>
                  <span className="text-[11px]">6px radius</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quiet Status Bottom: Berechnete Farbkontraste statt pauschaler AAA-Aussage */}
          <div className="border-t border-border/60 pt-4 mt-6 font-mono text-xs text-muted-foreground space-y-2.5">
            <div className="flex items-center justify-between">
              <span>Token-Bindung</span>
              <span className="font-medium text-foreground">W3C DTCG (tokens.css)</span>
            </div>

            {/* Konkrete berechnete Farbpaarungen */}
            <div className="rounded-xl border border-border/60 bg-muted/20 p-2.5 space-y-2">
              <div className="flex items-center justify-between text-[11px] font-sans font-semibold text-foreground">
                <span>Berechnete Farbkontraste (WCAG 2.1)</span>
              </div>

              <div className="space-y-1.5 text-[11px]">
                {calculatedPairs.map((pair, idx) => (
                  <div key={idx} className="flex items-center justify-between gap-1.5">
                    <div className="truncate">
                      <span className="text-foreground font-medium">{pair.role}:</span>{" "}
                      <span className="text-muted-foreground text-[10px]">{pair.fg} auf {pair.bg}</span>
                    </div>
                    <div className="shrink-0 flex items-center gap-1 font-mono">
                      <span className="font-semibold text-foreground">{pair.ratio.toFixed(2)}:1</span>
                      <span
                        className={`text-[9px] px-1.5 py-0.2 rounded font-semibold ${
                          pair.ratio >= 7.0
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                            : pair.ratio >= 4.5
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                            : "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                        }`}
                      >
                        {pair.level}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span>Katalog-Freigabe</span>
              <span className="text-foreground font-mono text-[11px]">
                {activeComponent === "button"
                  ? "ButtonApi (.strict)"
                  : activeComponent === "form-field"
                  ? "FormFieldApi (.strict)"
                  : "ButtonApi + FormFieldApi"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
