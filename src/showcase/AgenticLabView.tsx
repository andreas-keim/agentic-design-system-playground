import { useState, useRef, useEffect } from "react"
import {
  RotateCcw,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Check,
  X,
} from "lucide-react"
import { Tooltip } from "@base-ui/react/tooltip"

import { useShowcase } from "./ShowcaseContext"
import { PageHeader } from "./PageHeader"
import { SegmentedTabs } from "./SegmentedTabs"
import { Button } from "@/components/ui/button"
import { FormField } from "@/components/ui/form-field"

interface ViolationMarkerProps {
  label: string
  detail: string
}

function ViolationMarker({ label, detail }: ViolationMarkerProps) {
  return (
    <Tooltip.Provider delay={100} closeDelay={150}>
      <Tooltip.Root>
        <Tooltip.Trigger
          type="button"
          aria-label={`${label}: ${detail}`}
          className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md border border-rose-500/30 bg-rose-500/8 dark:bg-rose-500/10 hover:bg-rose-500/15 transition-colors cursor-help text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500/40 select-none shrink-0"
        >
          <AlertTriangle className="h-3 w-3 text-rose-500 shrink-0" aria-hidden="true" />
          <span className="font-medium text-foreground">{label}</span>
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Positioner side="top" sideOffset={6} className="z-50">
            <Tooltip.Popup className="rounded-md border border-border bg-popover px-2.5 py-1 text-xs text-popover-foreground shadow-md max-w-xs leading-normal font-sans">
              {detail}
            </Tooltip.Popup>
          </Tooltip.Positioner>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  )
}

interface SimulationSwitchProps {
  label: string
  checked: boolean
  onChange: () => void
}

function SimulationSwitch({ label, checked, onChange }: SimulationSwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className="p-2.5 rounded-lg border border-border/80 bg-card hover:bg-muted/40 transition-colors cursor-pointer text-left flex items-center justify-between gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 select-none group h-full"
    >
      <div className="flex flex-col min-w-0 pr-1">
        <span className="text-xs font-medium text-foreground leading-snug">
          {label}
        </span>
        <span className="text-[11px] text-muted-foreground mt-0.5">
          {checked ? "An" : "Aus"}
        </span>
      </div>

      <span
        aria-hidden="true"
        className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors duration-200 ease-in-out ${
          checked
            ? "bg-rose-500/90 dark:bg-rose-600"
            : "bg-muted-foreground/30 dark:bg-muted-foreground/25"
        }`}
      >
        <span
          className={`inline-block h-4 w-4 rounded-full bg-white shadow-xs transition-transform duration-200 ease-in-out ${
            checked ? "translate-x-4.5" : "translate-x-0.5"
          }`}
        />
      </span>
    </button>
  )
}

export function AgenticLabView() {
  const { setActiveTab } = useShowcase()

  // Direct error states: starts in the unguided raw LLM state (3 violations active)
  const [sabotageHex, setSabotageHex] = useState<boolean>(true)
  const [sabotageGrid, setSabotageGrid] = useState<boolean>(true)
  const [sabotageA11y, setSabotageA11y] = useState<boolean>(true)

  // Scanner animation trigger
  const [isScanning, setIsScanning] = useState<boolean>(false)

  // Ref to track and cancel pending scan timeouts on reset or unmount
  const timeoutsRef = useRef<number[]>([])

  function clearScanTimeouts() {
    timeoutsRef.current.forEach((id) => window.clearTimeout(id))
    timeoutsRef.current = []
  }

  useEffect(() => {
    return () => {
      clearScanTimeouts()
    }
  }, [])

  // Sub-tab in code panel
  const [codeTab, setCodeTab] = useState<"diff" | "rules">("diff")

  const isColorBroken = sabotageHex
  const isGridBroken = sabotageGrid
  const isA11yBroken = sabotageA11y

  const activeViolationsCount =
    (isColorBroken ? 1 : 0) + (isGridBroken ? 1 : 0) + (isA11yBroken ? 1 : 0)

  const isFullyGuarded = activeViolationsCount === 0

  // Bi-directional Ping-Pong Sweep (Down & Up, 2000ms total)
  // Bei prefers-reduced-motion: sofortiger Wechsel ohne Scan-Animation
  function healAll() {
    clearScanTimeouts()

    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches

    if (prefersReducedMotion) {
      setSabotageHex(false)
      setSabotageGrid(false)
      setSabotageA11y(false)
      setIsScanning(false)
      return
    }

    setIsScanning(true)

    // Phase 1 (0ms - 1000ms): Scanner sweeps DOWN to inspect full canvas
    // Phase 2 (1000ms - 2000ms): Scanner sweeps BACK UP, healing each element on return
    const t1 = window.setTimeout(() => {
      setSabotageHex(false) // 1150ms: heals Button at the bottom
    }, 1150)

    const t2 = window.setTimeout(() => {
      setSabotageGrid(false) // 1450ms: snaps Spacing in the middle
    }, 1450)

    const t3 = window.setTimeout(() => {
      setSabotageA11y(false) // 1750ms: fixes Input at the top
    }, 1750)

    const t4 = window.setTimeout(() => {
      setIsScanning(false) // 2000ms: scanner completes at the top
    }, 2000)

    timeoutsRef.current = [t1, t2, t3, t4]
  }

  // Reset back to initial error state
  function resetAll() {
    clearScanTimeouts()
    setIsScanning(false)
    setSabotageHex(true)
    setSabotageGrid(true)
    setSabotageA11y(true)
  }

  function handleCheckSpecs() {
    window.location.hash = "testfall-03"
    setActiveTab("specs")
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      {/* 1. Page Header with thesis and direct Specs link */}
      <PageHeader
        title="Agentic UI Guardrail Lab"
        subtitle="Browser-Simulation: So korrigiert ein deterministisches Design System typische Fehler in Agenten-Ausgaben."
        action={
          <button
            type="button"
            onClick={handleCheckSpecs}
            aria-label="Echten Testfall in Architecture Specs ansehen"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground hover:text-primary transition-colors cursor-pointer shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded-sm self-start md:self-end"
          >
            <span>Echten Testfall ansehen</span>
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
        }
      />

      {/* 2. Split-Studio Stage (24px gap, aligned top and bottoms) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left Column: Live Component Canvas (6 Cols) */}
        <section className="lg:col-span-6 rounded-2xl border border-border/80 bg-card shadow-xs flex flex-col overflow-hidden relative">
          {/* Precision Sweep Beam (Scanner Animation) */}
          {isScanning && (
            <div className="pointer-events-none absolute inset-x-0 z-30 h-1 animate-scan-sweep motion-reduce:hidden">
              <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-violet-500 dark:via-violet-400 to-transparent shadow-[0_0_16px_rgba(124,58,237,0.85)]" />
              <div className="h-10 -mt-5 w-full bg-gradient-to-r from-transparent via-violet-500/20 dark:via-violet-400/25 to-transparent blur-sm" />
            </div>
          )}

          {/* Left Header: Exact h-16, px-6, matching right header */}
          <div className="h-16 px-6 border-b border-border/60 bg-card shrink-0 flex items-center justify-between gap-4">
            <h3 className="text-base font-semibold tracking-tight text-foreground leading-tight">
              {isFullyGuarded ? "Korrigierte Ausgabe" : "Ungeprüfte Ausgabe"}
            </h3>

            {/* Main Action or Healed State */}
            {!isFullyGuarded ? (
              <Button
                variant="primary"
                size="sm"
                disabled={isScanning}
                onClick={healAll}
                className="text-xs h-8 px-3.5 font-medium cursor-pointer shrink-0"
              >
                Fehler automatisch korrigieren
              </Button>
            ) : (
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Korrigiert</span>
                </span>
                <button
                  type="button"
                  onClick={resetAll}
                  className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded-sm shrink-0"
                  title="Simulation auf Ausgangszustand zurücksetzen"
                >
                  <RotateCcw className="h-3 w-3" />
                  <span>Reset</span>
                </button>
              </div>
            )}
          </div>

          {/* Canvas Area: Centered with generous breathing room */}
          <div className="flex-1 min-h-[380px] p-6 sm:p-8 flex items-center justify-center bg-muted/25 dark:bg-muted/10">
            {/* The Live Component (Neutral card border, calm presentation) */}
            <div className="w-full max-w-md rounded-xl border border-border/80 bg-card p-6 shadow-xs transition-all">
              {/* Header */}
              <div className="border-b border-border/60 pb-3 mb-4">
                <h2 className="text-sm font-bold text-foreground tracking-tight">
                  Rollen- &amp; Rechteverwaltung
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Sicherheitsfreigabe für Workspace-Cluster
                </p>
              </div>

              {/* 1. Element: Input / FormField */}
              <div className="relative">
                {isA11yBroken && (
                  <div className="mb-2 flex items-center">
                    <ViolationMarker
                      label="Label fehlt"
                      detail="Das Eingabefeld hat kein zugängliches Label · WCAG 3.3.2"
                    />
                  </div>
                )}

                {isA11yBroken ? (
                  <input
                    type="text"
                    defaultValue="SYS-REC-84920 (Cluster Admin // Level 3)"
                    disabled={isScanning}
                    className="w-full rounded-md border border-rose-500 dark:border-rose-500/70 bg-background px-3.5 py-2 text-xs text-foreground outline-none font-sans"
                    placeholder="Freigabe-Schlüssel..."
                  />
                ) : (
                  <FormField
                    label="Sicherheits-Schlüssel & Berechtigungsstufe"
                    defaultValue="SYS-REC-84920 (Cluster Admin // Level 3)"
                    disabled={isScanning}
                  />
                )}
              </div>

              {/* 2. Element: Spacing Margin */}
              <div className={isGridBroken ? "my-2.5 flex items-center" : "h-4"}>
                {isGridBroken && (
                  <ViolationMarker
                    label="Abstand nicht im Raster"
                    detail="13 px verletzt das 8-px-Raster"
                  />
                )}
              </div>

              {/* 3. Element: Action Buttons */}
              <div className="pt-3 border-t border-border/60 flex items-center justify-between gap-2 flex-wrap">
                <Button variant="outline" size="sm" className="text-xs h-8">
                  Widerrufen
                </Button>

                <div className="flex items-center gap-2 flex-wrap justify-end">
                  {isColorBroken && (
                    <ViolationMarker
                      label="Farbe nicht freigegeben"
                      detail="Hardcodiertes #ef4444 umgeht den freigegebenen Farb-Token"
                    />
                  )}

                  {isColorBroken ? (
                    <button
                      type="button"
                      disabled={isScanning}
                      className="rounded-lg px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs transition-colors cursor-pointer shrink-0"
                      style={{ backgroundColor: "#ef4444" }}
                    >
                      Speichern
                    </button>
                  ) : (
                    <Button variant="primary" size="sm" className="text-xs h-8 shrink-0">
                      Speichern
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Left Footer: Clear Component & Status Info */}
          <div className="h-12 px-6 border-t border-border/60 text-xs text-muted-foreground flex items-center justify-between bg-card shrink-0">
            <span className="font-medium text-foreground truncate">
              Beispiel: Rollen- &amp; Rechteverwaltung
            </span>
            <span
              className={
                isFullyGuarded
                  ? "text-muted-foreground font-mono shrink-0"
                  : "text-rose-600 dark:text-rose-400 font-semibold font-mono shrink-0"
              }
            >
              {isFullyGuarded
                ? "Simulation: 0 Verstöße"
                : `${activeViolationsCount} ${
                    activeViolationsCount === 1 ? "simulierter Verstoß" : "simulierte Verstöße"
                  }`}
            </span>
          </div>
        </section>

        {/* Right Column: Simulated Inspector / Diff (6 Cols) */}
        <section className="lg:col-span-6 rounded-2xl border border-border/80 bg-card shadow-xs flex flex-col overflow-hidden">
          {/* Right Header: Exact h-16, px-6, matching left header */}
          <div className="h-16 px-6 border-b border-border/60 bg-card shrink-0 flex items-center justify-between gap-4">
            <h3 className="text-base font-semibold tracking-tight text-foreground leading-tight">
              Simulierter Prüfbericht
            </h3>

            <SegmentedTabs<"diff" | "rules">
              items={[
                { id: "diff", label: "Code-Vergleich" },
                { id: "rules", label: "Geprüfte Regeln" },
              ]}
              value={codeTab}
              onChange={setCodeTab}
            />
          </div>

          {/* Right Body: Top-aligned Diff/Rules + Bottom Error Simulator */}
          <div className="p-6 flex-1 flex flex-col justify-between gap-6">
            {/* Top: Diff / Rule Report */}
            <div>
              <div className="p-4 overflow-y-auto font-mono text-xs leading-relaxed select-text rounded-xl border border-border/60 bg-muted/25 dark:bg-muted/10 min-h-[220px]">
                {codeTab === "diff" ? (
                  <div className="space-y-2.5">
                    {/* Line 1: Label / Input */}
                    {isA11yBroken ? (
                      <div className="bg-rose-500/8 border-l-2 border-rose-500 px-3 py-2 flex items-start justify-between gap-2 rounded-r">
                        <div className="text-foreground">
                          <span className="text-rose-500 font-bold mr-1.5">-</span>
                          <span>&lt;input type="text" placeholder="Key..." /&gt;</span>
                        </div>
                        <span className="text-[11px] text-muted-foreground shrink-0 font-sans"># Label fehlt</span>
                      </div>
                    ) : (
                      <div className="bg-emerald-500/8 border-l-2 border-emerald-500 px-3 py-2 flex items-start justify-between gap-2 rounded-r">
                        <div className="text-foreground">
                          <span className="text-emerald-600 dark:text-emerald-400 font-bold mr-1.5">+</span>
                          <span>&lt;FormField label="Sicherheits-Schlüssel" /&gt;</span>
                        </div>
                        <span className="text-[11px] text-muted-foreground shrink-0 font-sans"># WCAG 3.3.2 erfüllt</span>
                      </div>
                    )}

                    {/* Line 2: Spacing Grid */}
                    {isGridBroken ? (
                      <div className="bg-rose-500/8 border-l-2 border-rose-500 px-3 py-2 flex items-start justify-between gap-2 rounded-r">
                        <div className="text-foreground">
                          <span className="text-rose-500 font-bold mr-1.5">-</span>
                          <span>&lt;div style=&#123;&#123; marginBottom: "13px" &#125;&#125; /&gt;</span>
                        </div>
                        <span className="text-[11px] text-muted-foreground shrink-0 font-sans"># Abstand außerhalb des Rasters</span>
                      </div>
                    ) : (
                      <div className="bg-emerald-500/8 border-l-2 border-emerald-500 px-3 py-2 flex items-start justify-between gap-2 rounded-r">
                        <div className="text-foreground">
                          <span className="text-emerald-600 dark:text-emerald-400 font-bold mr-1.5">+</span>
                          <span>&lt;div className="mb-4" /&gt;</span>
                        </div>
                        <span className="text-[11px] text-muted-foreground shrink-0 font-sans"># 8-px-Raster eingehalten</span>
                      </div>
                    )}

                    {/* Line 3: Action Button Color */}
                    {isColorBroken ? (
                      <div className="bg-rose-500/8 border-l-2 border-rose-500 px-3 py-2 flex items-start justify-between gap-2 rounded-r">
                        <div className="text-foreground">
                          <span className="text-rose-500 font-bold mr-1.5">-</span>
                          <span>&lt;button style=&#123;&#123; backgroundColor: "#ef4444" &#125;&#125;&gt;</span>
                        </div>
                        <span className="text-[11px] text-muted-foreground shrink-0 font-sans"># Farbe ohne Token</span>
                      </div>
                    ) : (
                      <div className="bg-emerald-500/8 border-l-2 border-emerald-500 px-3 py-2 flex items-start justify-between gap-2 rounded-r">
                        <div className="text-foreground">
                          <span className="text-emerald-600 dark:text-emerald-400 font-bold mr-1.5">+</span>
                          <span>&lt;Button variant="primary"&gt;Speichern&lt;/Button&gt;</span>
                        </div>
                        <span className="text-[11px] text-muted-foreground shrink-0 font-sans"># Primär-Token verwendet</span>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Rules Tab */
                  <div className="space-y-3 text-xs font-mono">
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                      <span className="font-semibold text-foreground">rule.single-primary-action:</span>
                      <span className="text-muted-foreground font-sans">1 Primary button definiert</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {isGridBroken ? (
                        <X className="h-4 w-4 text-rose-500 shrink-0" />
                      ) : (
                        <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                      )}
                      <span className="font-semibold text-foreground">rule.modular-scale:</span>
                      <span
                        className={
                          isGridBroken
                            ? "text-rose-600 dark:text-rose-400 font-medium font-sans"
                            : "text-muted-foreground font-sans"
                        }
                      >
                        {isGridBroken
                          ? "13px verletzt 8px-Basiseinheit"
                          : "16px entspricht Token --space-component-md"}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {isA11yBroken ? (
                        <X className="h-4 w-4 text-rose-500 shrink-0" />
                      ) : (
                        <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                      )}
                      <span className="font-semibold text-foreground">rule.wcag-aria-binding:</span>
                      <span
                        className={
                          isA11yBroken
                            ? "text-rose-600 dark:text-rose-400 font-medium font-sans"
                            : "text-muted-foreground font-sans"
                        }
                      >
                        {isA11yBroken
                          ? "<input> fehlt verknüpftes Label (WCAG 3.3.2)"
                          : "FormField verknüpft Label mit Input-ID"}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {isColorBroken ? (
                        <X className="h-4 w-4 text-rose-500 shrink-0" />
                      ) : (
                        <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                      )}
                      <span className="font-semibold text-foreground">rule.no-inline-hex:</span>
                      <span
                        className={
                          isColorBroken
                            ? "text-rose-600 dark:text-rose-400 font-medium font-sans"
                            : "text-muted-foreground font-sans"
                        }
                      >
                        {isColorBroken
                          ? "#ef4444 unzulässig ohne Design-Token"
                          : "var(--color-background-primary-default) gebunden"}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom: Error Simulation Controls */}
            <div className="pt-4 border-t border-border/60 space-y-3 mt-auto">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-foreground">Fehler simulieren</span>
                <span className="text-[11px] text-muted-foreground">Einzelne Verstöße gezielt an- und abschalten</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <SimulationSwitch
                  label="Label fehlt"
                  checked={sabotageA11y}
                  onChange={() => setSabotageA11y((p) => !p)}
                />
                <SimulationSwitch
                  label="Abstand nicht im Raster"
                  checked={sabotageGrid}
                  onChange={() => setSabotageGrid((p) => !p)}
                />
                <SimulationSwitch
                  label="Farbe nicht freigegeben"
                  checked={sabotageHex}
                  onChange={() => setSabotageHex((p) => !p)}
                />
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
