import { useState } from "react"
import {
  RotateCcw,
  AlertTriangle,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { FormField } from "@/components/ui/form-field"

export function AgenticLabView() {
  // Direct error states: starts in the unguided raw LLM state (3 violations active)
  const [sabotageHex, setSabotageHex] = useState<boolean>(true)
  const [sabotageGrid, setSabotageGrid] = useState<boolean>(true)
  const [sabotageA11y, setSabotageA11y] = useState<boolean>(true)

  // Scanner animation trigger
  const [isScanning, setIsScanning] = useState<boolean>(false)

  // Sub-tab in code panel
  const [codeTab, setCodeTab] = useState<"diff" | "rules">("diff")

  const isColorBroken = sabotageHex
  const isGridBroken = sabotageGrid
  const isA11yBroken = sabotageA11y

  const activeViolationsCount =
    (isColorBroken ? 1 : 0) + (isGridBroken ? 1 : 0) + (isA11yBroken ? 1 : 0)

  const isFullyGuarded = activeViolationsCount === 0

  // Bi-directional Ping-Pong Sweep (Down & Up, 2000ms total)
  function healAll() {
    if (isScanning) return
    setIsScanning(true)

    // Phase 1 (0ms - 1000ms): Scanner sweeps DOWN to inspect full canvas

    // Phase 2 (1000ms - 2000ms): Scanner sweeps BACK UP, healing each element on return
    setTimeout(() => {
      setSabotageHex(false) // 1150ms: heals Button at the bottom
    }, 1150)

    setTimeout(() => {
      setSabotageGrid(false) // 1450ms: snaps Spacing in the middle
    }, 1450)

    setTimeout(() => {
      setSabotageA11y(false) // 1750ms: fixes Input at the top
    }, 1750)

    setTimeout(() => {
      setIsScanning(false) // 2000ms: scanner completes at the top
    }, 2000)
  }

  // Reset back to initial error state
  function resetAll() {
    setSabotageHex(true)
    setSabotageGrid(true)
    setSabotageA11y(true)
  }

  return (
    <div className="h-[calc(100vh-56px)] flex flex-col justify-between max-w-7xl mx-auto px-6 py-6 pb-8 overflow-hidden select-none">
      
      {/* ========================================================================= */}
      {/* 1. HERO HEADER (APPLE STYLE: GROSS, KRAFTVOLL, ATMET FREI)                */}
      {/* ========================================================================= */}
      <header className="pb-4 border-b border-border/60 shrink-0">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground leading-none">
          Code ohne Halluzinationen.
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-2 font-normal">
          Wie ein Design System KI-Code produktionsreif macht.
        </p>
      </header>

      {/* ========================================================================= */}
      {/* 2. SPLIT-STUDIO STAGE (GENEROUS PADDING, 100% ABOVE THE FOLD)             */}
      {/* ========================================================================= */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 py-5 min-h-0 items-stretch">
        
        {/* ----------------------------------------------------------------------- */}
        {/* LEFT COLUMN: LIVE COMPONENT CANVAS (6 COLS)                             */}
        {/* ----------------------------------------------------------------------- */}
        <section className="lg:col-span-6 flex flex-col justify-between rounded-2xl border border-border/80 bg-card/60 backdrop-blur-md shadow-xs p-6 sm:p-7 relative overflow-hidden">
          
          {/* Precision Sweep Beam: Sweeps across the entire left canvas in Brand Violet */}
          {isScanning && (
            <div className="pointer-events-none absolute inset-x-0 z-30 h-1 animate-scan-sweep">
              {/* Sharp laser line in Brand Violet */}
              <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-violet-500 dark:via-violet-400 to-transparent shadow-[0_0_16px_rgba(124,58,237,0.85)]" />
              {/* Soft ambient glow diffuser in Brand Violet */}
              <div className="h-10 -mt-5 w-full bg-gradient-to-r from-transparent via-violet-500/20 dark:via-violet-400/25 to-transparent blur-sm" />
            </div>
          )}

          {/* Top Label & Mode Indicator */}
          <div className="flex items-center justify-between pb-3 border-b border-border/40">
            <span className="font-mono text-xs font-bold text-foreground">
              <span className={isFullyGuarded ? "text-muted-foreground font-medium" : "text-rose-500 font-semibold"}>
                {isFullyGuarded ? "W3C Validiert" : "Ungeschützt (Raw Code)"}
              </span>
            </span>

            {/* Quick action button when broken, or subtle reset when healed */}
            {!isFullyGuarded ? (
              <button
                onClick={healAll}
                className="px-3 py-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/40 text-emerald-600 dark:text-emerald-400 font-mono text-xs font-bold hover:bg-emerald-500/25 active:scale-95 transition-all cursor-pointer shadow-2xs"
              >
                Auto-Fix anwenden
              </button>
            ) : (
              <button
                onClick={resetAll}
                className="flex items-center gap-1.5 text-muted-foreground/60 hover:text-foreground text-xs font-mono transition-colors cursor-pointer active:scale-95"
                title="Auf Ausgangszustand zurücksetzen"
              >
                <RotateCcw className="h-3 w-3" />
                <span>Zurücksetzen</span>
              </button>
            )}
          </div>

          {/* The Live Component (Generous vertical space and calm presentation) */}
          <div className="my-auto py-4 flex flex-col items-center justify-center">
            <div
              className={`w-full max-w-md rounded-2xl border p-5 sm:p-6 transition-all duration-300 bg-card relative ${
                !isFullyGuarded
                  ? "border-rose-500/70 shadow-rose-500/5 ring-1 ring-rose-500/30"
                  : "border-border/80 shadow-xs"
              }`}
            >
              {/* Header */}
              <div className="border-b border-border/60 pb-3 mb-4">
                <h2 className="text-sm font-bold text-foreground tracking-tight">
                  Rollen- &amp; Rechteverwaltung
                </h2>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Sicherheitsfreigabe für Workspace-Cluster
                </p>
              </div>

              {/* 1. Element: Input / FormField */}
              <div className="relative">
                {/* Red warning ONLY when broken */}
                {isA11yBroken && (
                  <div className="mb-1.5 flex items-center justify-between text-[10px] font-mono text-rose-500 bg-rose-500/10 border border-rose-500/20 px-2.5 py-1 rounded-md">
                    <span className="font-bold flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      Fehler 1: Nacktes &lt;input&gt; ohne Label
                    </span>
                    <span className="opacity-80">WCAG 3.3.2 Fail</span>
                  </div>
                )}

                {isA11yBroken ? (
                  <input
                    type="text"
                    defaultValue="SYS-REC-84920 (Cluster Admin // Level 3)"
                    className="w-full rounded-md border border-rose-400 dark:border-rose-600/70 bg-background px-3.5 py-2 text-xs text-foreground outline-none font-sans"
                    placeholder="Freigabe-Schlüssel..."
                  />
                ) : (
                  <FormField
                    label="Sicherheits-Schlüssel & Berechtigungsstufe"
                    defaultValue="SYS-REC-84920 (Cluster Admin // Level 3)"
                    disabled={false}
                  />
                )}
              </div>

              {/* 2. Element: Spacing Margin */}
              <div className="my-2">
                {isGridBroken ? (
                  <div className="flex items-center justify-between text-[10px] font-mono text-rose-500 bg-rose-500/10 border border-rose-500/20 px-2.5 py-1 rounded-md">
                    <span className="font-bold flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      Fehler 2: 13px Willkür-Abstand
                    </span>
                    <span className="opacity-80">8px-Raster zerschlagen</span>
                  </div>
                ) : (
                  /* Clean, natural 16px space */
                  <div className="h-4" />
                )}
              </div>

              {/* 3. Element: Action Buttons */}
              <div className="pt-3 border-t border-border/60 flex items-center justify-between gap-3">
                <Button variant="outline" size="sm" className="text-xs h-8">
                  Widerrufen
                </Button>

                <div className="flex items-center gap-2">
                  {isColorBroken && (
                    <span className="text-[10px] font-mono text-rose-500 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded">
                      Fehler 3: Hex #ef4444
                    </span>
                  )}

                  {isColorBroken ? (
                    <button
                      type="button"
                      className="rounded-md px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs transition-colors cursor-pointer"
                      style={{ backgroundColor: "#ef4444" }}
                    >
                      Speichern
                    </button>
                  ) : (
                    <Button variant="primary" size="sm" className="text-xs h-8">
                      Speichern
                    </Button>
                  )}
                </div>
              </div>

            </div>
          </div>

          {/* Bottom Micro Status */}
          <div className="pt-3 border-t border-border/40 text-[11px] text-muted-foreground flex items-center justify-between font-mono">
            <span>Komponente: AccessPermissionModal</span>
            <span className={isFullyGuarded ? "text-muted-foreground" : "text-rose-500 font-semibold"}>
              {isFullyGuarded
                ? "0 Verstöße · Produktionsbereit"
                : `${activeViolationsCount} ${activeViolationsCount === 1 ? "Regel-Verstoß" : "Regel-Verstöße"}`}
            </span>
          </div>

        </section>

        {/* ----------------------------------------------------------------------- */}
        {/* RIGHT COLUMN: HARMONIOUS CODE INSPECTOR (6 COLS)                         */}
        {/* ----------------------------------------------------------------------- */}
        <section className="lg:col-span-6 flex flex-col justify-between rounded-2xl border border-border/80 bg-card/90 shadow-xs p-6 sm:p-7 overflow-hidden">
          
          {/* Console Header & Tabs */}
          <div className="flex items-center justify-between pb-3 border-b border-border/60 text-xs font-mono">
            <div className="text-foreground font-bold">
              <span>Code Guardrail Inspector</span>
            </div>

            <div className="flex items-center gap-1 bg-muted/70 p-0.5 rounded-lg border border-border/60">
              <button
                onClick={() => setCodeTab("diff")}
                className={`px-3 py-1 rounded text-[11px] transition-colors ${
                  codeTab === "diff" ? "bg-card text-foreground font-bold shadow-2xs" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                JSX Code Diff
              </button>
              <button
                onClick={() => setCodeTab("rules")}
                className={`px-3 py-1 rounded text-[11px] transition-colors ${
                  codeTab === "rules" ? "bg-card text-foreground font-bold shadow-2xs" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                AST Engine Log
              </button>
            </div>
          </div>

          {/* Clean Editor / Diff Window (Matches App Palette, roomy vertical padding) */}
          <div className="my-auto py-3.5 px-4 overflow-y-auto font-mono text-[11.5px] leading-relaxed select-text rounded-xl border border-border/60 bg-muted/25 dark:bg-muted/10">
            {codeTab === "diff" ? (
              <div className="space-y-2">
                {/* Line 1: Label / Input */}
                {isA11yBroken ? (
                  <div className="bg-rose-500/10 border-l-2 border-rose-500 px-2.5 py-1.5 text-rose-700 dark:text-rose-400 flex items-start justify-between rounded-r">
                    <span>- &lt;input type="text" placeholder="Key..." /&gt;</span>
                    <span className="text-[10px] text-rose-500/80"># No accessible label</span>
                  </div>
                ) : (
                  <div className="bg-emerald-500/10 border-l-2 border-emerald-500 px-2.5 py-1.5 text-emerald-800 dark:text-emerald-400 flex items-start justify-between rounded-r">
                    <span>+ &lt;FormField label="Sicherheits-Schlüssel" /&gt;</span>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400/80"># WCAG 3.3.2 Enforced</span>
                  </div>
                )}

                {/* Line 2: Spacing Grid */}
                {isGridBroken ? (
                  <div className="bg-rose-500/10 border-l-2 border-rose-500 px-2.5 py-1.5 text-rose-700 dark:text-rose-400 flex items-start justify-between rounded-r">
                    <span>- &lt;div style=&#123;&#123; marginBottom: "13px" &#125;&#125; /&gt;</span>
                    <span className="text-[10px] text-rose-500/80"># Arbitrary spacing</span>
                  </div>
                ) : (
                  <div className="bg-emerald-500/10 border-l-2 border-emerald-500 px-2.5 py-1.5 text-emerald-800 dark:text-emerald-400 flex items-start justify-between rounded-r">
                    <span>+ &lt;div className="mb-4" /&gt; {/* 16px: space-md */}</span>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400/80"># 8px DTCG grid</span>
                  </div>
                )}

                {/* Line 3: Action Button Color */}
                {isColorBroken ? (
                  <div className="bg-rose-500/10 border-l-2 border-rose-500 px-2.5 py-1.5 text-rose-700 dark:text-rose-400 flex items-start justify-between rounded-r">
                    <span>- &lt;button style=&#123;&#123; backgroundColor: "#ef4444" &#125;&#125;&gt;</span>
                    <span className="text-[10px] text-rose-500/80"># Rogue hex color</span>
                  </div>
                ) : (
                  <div className="bg-emerald-500/10 border-l-2 border-emerald-500 px-2.5 py-1.5 text-emerald-800 dark:text-emerald-400 flex items-start justify-between rounded-r">
                    <span>+ &lt;Button variant="primary"&gt;Speichern&lt;/Button&gt;</span>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400/80"># color.action.primary</span>
                  </div>
                )}
              </div>
            ) : (
              /* AST Engine Log Tab */
              <div className="space-y-2 text-foreground text-[11px]">
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                  <span>✓</span>
                  <span>rule.single-primary-action: 1 Primary button defined</span>
                </div>
                <div className={`flex items-center gap-2 ${isGridBroken ? "text-rose-500" : "text-emerald-600 dark:text-emerald-400"}`}>
                  <span>{isGridBroken ? "✗" : "✓"}</span>
                  <span>
                    {isGridBroken
                      ? "rule.modular-scale: 13px violates 8px base grid unit"
                      : "rule.modular-scale: 16px snapped to token --space-md"}
                  </span>
                </div>
                <div className={`flex items-center gap-2 ${isA11yBroken ? "text-rose-500" : "text-emerald-600 dark:text-emerald-400"}`}>
                  <span>{isA11yBroken ? "✗" : "✓"}</span>
                  <span>
                    {isA11yBroken
                      ? "rule.wcag-aria-binding: <input> lacks programmatic label"
                      : "rule.wcag-aria-binding: FormField associates label with input ID"}
                  </span>
                </div>
                <div className={`flex items-center gap-2 ${isColorBroken ? "text-rose-500" : "text-emerald-600 dark:text-emerald-400"}`}>
                  <span>{isColorBroken ? "✗" : "✓"}</span>
                  <span>
                    {isColorBroken
                      ? "rule.no-inline-hex: #ef4444 prohibited without token alias"
                      : "rule.no-inline-hex: var(--ds-color-action-primary) compiled"}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Interactive Error Simulation Panel */}
          <div className="pt-3.5 border-t border-border/60 space-y-2.5">
            <div className="text-[11px] font-mono text-foreground font-bold">
              <span>Fehler simulieren</span>
            </div>

            <div className="grid grid-cols-3 gap-2 font-mono text-[11px]">
              <button
                onClick={() => setSabotageHex((p) => !p)}
                className={`py-2 px-2.5 rounded-lg border transition-all text-center ${
                  sabotageHex
                    ? "bg-rose-500/15 border-rose-500/40 text-rose-600 dark:text-rose-400 font-bold shadow-2xs"
                    : "bg-card border-border/80 text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                Hex #ef4444 {sabotageHex ? "✕" : "○"}
              </button>

              <button
                onClick={() => setSabotageGrid((p) => !p)}
                className={`py-2 px-2.5 rounded-lg border transition-all text-center ${
                  sabotageGrid
                    ? "bg-rose-500/15 border-rose-500/40 text-rose-600 dark:text-rose-400 font-bold shadow-2xs"
                    : "bg-card border-border/80 text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                13px Grid {sabotageGrid ? "✕" : "○"}
              </button>

              <button
                onClick={() => setSabotageA11y((p) => !p)}
                className={`py-2 px-2.5 rounded-lg border transition-all text-center ${
                  sabotageA11y
                    ? "bg-rose-500/15 border-rose-500/40 text-rose-600 dark:text-rose-400 font-bold shadow-2xs"
                    : "bg-card border-border/80 text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                Label weg {sabotageA11y ? "✕" : "○"}
              </button>
            </div>
          </div>

        </section>

      </main>

    </div>
  )
}
