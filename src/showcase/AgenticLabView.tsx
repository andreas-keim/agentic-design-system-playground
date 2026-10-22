import { useState, useEffect, useRef } from "react"
import {
  Zap,
  Palette,
  Ruler,
  Eye,
  RotateCcw,
  Terminal,
  FastForward,
  CheckCircle2,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { FormField } from "@/components/ui/form-field"

type CinematicPhase =
  | "title-only"       // 1. Großes Intro: Nur die Frage zentriert auf dem Screen
  | "problem-revealed" // 2. Subtext blendet sich zentriert ein
  | "typing-prompt"    // 3. Prompt-Feld erscheint zentriert & tippt sich ein
  | "fading-out"       // 4. Headline & Prompt faden komplett aus
  | "component-clash"  // 5. Komponente erscheint groß in der Mitte (fehlerhaft)
  | "component-scan"   // 6. Guardrail greift ein
  | "interactive"      // 7. Geheiltes UI, 100% Fokus, Controls & Details sichtbar

type HighlightTarget = "color" | "grid" | "a11y" | null

const PROMPT_TEXT = "Erstelle ein B2B System-Access Panel mit Rollen-Freigabe und Lösch-Aktion."

export function AgenticLabView() {
  const [phase, setPhase] = useState<CinematicPhase>("title-only")
  const [typedPrompt, setTypedPrompt] = useState("")

  // Interactive sabotage states (available in interactive phase)
  const [sabotageColor, setSabotageColor] = useState(false)
  const [sabotageLabel, setSabotageLabel] = useState(false)
  const [highlighted, setHighlighted] = useState<HighlightTarget>(null)

  const timeoutsRef = useRef<NodeJS.Timeout[]>([])

  function clearAllTimers() {
    timeoutsRef.current.forEach(clearTimeout)
    timeoutsRef.current = []
  }

  // Cinematic Director
  function startCinematicExperience() {
    clearAllTimers()
    setPhase("title-only")
    setTypedPrompt("")
    setSabotageColor(false)
    setSabotageLabel(false)
    setHighlighted(null)

    // Phase 1 -> 2: Reveal Problem Statement (1.4s)
    const t1 = setTimeout(() => {
      setPhase("problem-revealed")
    }, 1400)

    // Phase 2 -> 3: Show Terminal & Type Prompt (3.0s)
    const t2 = setTimeout(() => {
      setPhase("typing-prompt")
      typePrompt(0)
    }, 3000)

    timeoutsRef.current.push(t1, t2)
  }

  // Typewriter Loop
  function typePrompt(index: number) {
    if (index <= PROMPT_TEXT.length) {
      setTypedPrompt(PROMPT_TEXT.slice(0, index))
      const delay = index === PROMPT_TEXT.length ? 500 : 20 + Math.random() * 16
      const t = setTimeout(() => typePrompt(index + 1), delay)
      timeoutsRef.current.push(t)
    } else {
      // Finished typing -> Fade out text & terminal completely (0.6s pause, then fade)
      const tFade = setTimeout(() => {
        setPhase("fading-out")
        transitionToComponentStage()
      }, 700)
      timeoutsRef.current.push(tFade)
    }
  }

  // Transition from Intro to Component Stage
  function transitionToComponentStage() {
    // Phase 4 -> 5: Headline & Prompt are gone, reveal Component Clash (0.7s)
    const tClash = setTimeout(() => {
      setPhase("component-clash")
    }, 700)

    // Phase 5 -> 6: Guardrail Scanner activates (2.0s after clash)
    const tScan = setTimeout(() => {
      setPhase("component-scan")
    }, 2300)

    // Phase 6 -> 7: Healed & Interactive (1.4s after scan)
    const tInteractive = setTimeout(() => {
      setPhase("interactive")
    }, 3600)

    timeoutsRef.current.push(tClash, tScan, tInteractive)
  }

  // Skip directly to the finished interactive view
  function skipToInteractive() {
    clearAllTimers()
    setPhase("interactive")
    setTypedPrompt(PROMPT_TEXT)
    setSabotageColor(false)
    setSabotageLabel(false)
  }

  useEffect(() => {
    startCinematicExperience()
    return () => clearAllTimers()
  }, [])

  // State calculations
  const isIntroActive =
    phase === "title-only" ||
    phase === "problem-revealed" ||
    phase === "typing-prompt" ||
    phase === "fading-out"

  const isComponentStageActive =
    phase === "component-clash" ||
    phase === "component-scan" ||
    phase === "interactive"

  const isBrokenUI =
    phase === "component-clash" ||
    sabotageColor ||
    sabotageLabel

  const isColorBroken =
    (phase === "component-clash") || sabotageColor

  const isLabelBroken =
    (phase === "component-clash") || sabotageLabel

  const isGridBroken =
    phase === "component-clash"

  return (
    <div className="relative min-h-[calc(100vh-140px)] flex flex-col justify-center px-4 py-6 sm:px-6">
      
      {/* Floating Replay / Skip Top Right Pill */}
      <div className="absolute top-4 right-4 sm:right-8 z-50">
        {isIntroActive ? (
          <button
            onClick={skipToInteractive}
            className="flex items-center gap-1.5 rounded-full bg-card/80 backdrop-blur-md border border-border/80 px-3.5 py-1.5 text-xs font-mono text-muted-foreground hover:text-foreground shadow-xs transition-all"
          >
            <FastForward className="h-3.5 w-3.5" />
            <span>Intro überspringen</span>
          </button>
        ) : (
          <button
            onClick={startCinematicExperience}
            className="flex items-center gap-1.5 rounded-full bg-card/80 backdrop-blur-md border border-primary/30 px-3.5 py-1.5 text-xs font-mono font-semibold text-primary hover:bg-primary/10 shadow-xs transition-all"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Film erneut ansehen</span>
          </button>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 1. CINEMATIC INTRO: GROSS & BILDSHIRM-ZENTRIERT                           */}
      {/* Verschwindet komplett, wenn die Komponenten die Bühne betreten            */}
      {/* ========================================================================= */}
      {isIntroActive && (
        <div
          className={`mx-auto max-w-3xl text-center flex flex-col items-center justify-center transition-all duration-700 ease-out ${
            phase === "fading-out"
              ? "opacity-0 -translate-y-8 scale-95 pointer-events-none"
              : "opacity-100 translate-y-0 scale-100"
          }`}
        >
          {/* 1. Die große Einstiegsfrage (Fullscreen Center) */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-foreground leading-[1.15]">
            Was passiert, wenn KI ohne Design System codet?
          </h1>

          {/* 2. Die Enthüllung des Problems */}
          <p
            className={`mt-6 text-base sm:text-xl text-muted-foreground max-w-2xl leading-relaxed transition-all duration-700 ease-out ${
              phase !== "title-only"
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-4"
            }`}
          >
            Frei laufende LLMs halluzinieren willkürliche Hex-Farben, zerschlagen Layout-Raster und vergessen Barrierefreiheit. 
            <span className="text-foreground font-semibold"> Unser System fängt den Code deterministisch ab.</span>
          </p>

          {/* 3. Das Terminal-Promptfeld (Zentriert) */}
          <div
            className={`mt-8 w-full max-w-xl transition-all duration-500 ease-out ${
              phase === "typing-prompt" || phase === "fading-out"
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-4 pointer-events-none"
            }`}
          >
            <div className="rounded-xl border border-border/90 bg-card p-4 shadow-xl text-left font-mono">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-border/50 text-muted-foreground text-[10px]">
                <div className="flex items-center gap-1.5">
                  <Terminal className="h-3.5 w-3.5 text-primary" />
                  <span className="font-semibold text-foreground">AI Coding Agent CLI</span>
                </div>
                <span className="bg-muted px-2 py-0.5 rounded text-[10px]">
                  Simulating Prompt
                </span>
              </div>

              <div className="flex items-center text-foreground font-mono text-xs sm:text-sm">
                <span className="text-primary font-bold mr-2">❯</span>
                <span className="tracking-tight">{typedPrompt}</span>
                <span className="inline-block w-2 h-4 bg-primary ml-1 animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. DIE KOMPONENTEN-BÜHNE: 100% FOKUS (Zentriert im Screen)                */}
      {/* Headlines & Prompt sind weg – Jetzt gehört die Bühne ganz der Komponente   */}
      {/* ========================================================================= */}
      {isComponentStageActive && (
        <div className="mx-auto w-full max-w-3xl animate-in fade-in zoom-in-95 duration-700 flex flex-col justify-center">
          
          {/* Status Label direkt über der Komponente */}
          <div className="flex items-center justify-between mb-3 px-2">
            <div className="flex items-center gap-2">
              <span
                className={`h-2.5 w-2.5 rounded-full ${
                  phase === "component-scan"
                    ? "bg-amber-500 animate-ping"
                    : isBrokenUI
                    ? "bg-rose-500 animate-pulse"
                    : "bg-emerald-500"
                }`}
              />
              <span className="font-mono text-xs font-semibold text-foreground">
                {phase === "component-scan"
                  ? "🛡️ Design System Guardrail greift ein: AST wird revalidiert..."
                  : isBrokenUI
                  ? "⚠️ Ungoverned LLM Output (KI-Halluzinationen aktiv)"
                  : "✓ W3C Token Governed (Produktionsreifes Design System)"}
              </span>
            </div>

            <span className="font-mono text-xs text-muted-foreground hidden sm:inline">
              {phase === "component-scan"
                ? "Latenz: < 2ms"
                : phase === "interactive" && !sabotageColor && !sabotageLabel
                ? "100% WCAG AA • 0% Design Debt"
                : "3 Schema-Verstöße"}
            </span>
          </div>

          {/* Der Zentrale Stage Canvas */}
          <div className="relative rounded-2xl border border-border/80 bg-card shadow-2xl overflow-hidden">
            
            {/* Glowing Scan Ray während der Heilung */}
            {phase === "component-scan" && (
              <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-transparent via-primary to-transparent z-40 animate-pulse shadow-[0_0_20px_#7c3aed]" />
            )}

            <div className="p-8 sm:p-14 flex flex-col items-center justify-center bg-muted/15 dark:bg-muted/5 min-h-[380px]">
              
              {/* Die eigentliche Komponente */}
              <div
                className={`w-full max-w-md bg-card rounded-xl border p-6 sm:p-8 shadow-sm relative transition-all duration-500 ${
                  isBrokenUI
                    ? "border-rose-500/80 shadow-rose-500/10 ring-2 ring-rose-500/30"
                    : "border-border/80"
                }`}
              >
                {/* Header */}
                <div className="border-b border-border/60 pb-3 mb-4">
                  <h2 className="text-sm sm:text-base font-bold text-foreground tracking-tight">
                    System Access &amp; Role Configuration
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Cluster node: <code className="font-mono text-[11px]">k8s-prod-eu-central-1</code>
                  </p>
                </div>

                {/* 1. Input Area */}
                <div
                  className={`relative transition-all rounded-lg p-1 ${
                    highlighted === "a11y" ? "ring-2 ring-primary/50 bg-primary/5" : ""
                  }`}
                >
                  {isLabelBroken && (
                    <div className="absolute -top-3.5 right-2 z-20 rounded bg-rose-600 text-white font-mono text-[10px] px-2 py-0.5 shadow-sm font-semibold flex items-center gap-1 animate-bounce">
                      <span>🔴 A11y: Nacktes Input (kein Label)</span>
                    </div>
                  )}

                  {isLabelBroken ? (
                    <div>
                      <input
                        type="text"
                        defaultValue="SYS-REC-84920 (Cluster Security Officer)"
                        className="w-full rounded border border-rose-400 dark:border-rose-600/60 bg-background px-3 py-2 text-xs text-foreground outline-none"
                        placeholder="Enter record clearance..."
                      />
                      <span className="text-[10px] text-rose-500 mt-1 block font-mono">
                        Screenreader melden nur "Textfeld ohne Namen" (WCAG 3.3.2 Verstoß)
                      </span>
                    </div>
                  ) : (
                    <FormField
                      label="Record Identifier & Clearance Level"
                      defaultValue="SYS-REC-84920 (Cluster Security Officer)"
                      disabled={false}
                    />
                  )}
                </div>

                {/* 2. Grid Margin */}
                <div
                  className={`relative transition-all ${
                    highlighted === "grid" ? "bg-amber-500/10 rounded" : ""
                  }`}
                  style={{ height: isGridBroken ? "13px" : "16px" }}
                >
                  {isGridBroken && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="bg-rose-500 text-white font-mono text-[9px] px-1.5 py-0.2 rounded font-bold">
                        13px (Zerschlägt 8px-Raster)
                      </span>
                    </div>
                  )}
                </div>

                {/* 3. Button Actions */}
                <div
                  className={`relative pt-3 border-t border-border/60 flex items-center justify-between transition-all rounded-lg p-1 ${
                    highlighted === "color" ? "ring-2 ring-primary/50 bg-primary/5" : ""
                  }`}
                >
                  {isColorBroken && (
                    <div className="absolute -top-3 left-2 z-20 rounded bg-rose-600 text-white font-mono text-[10px] px-2 py-0.5 shadow-sm font-semibold flex items-center gap-1">
                      <span>🔴 Hardcoded Hex #ef4444</span>
                    </div>
                  )}

                  <Button variant="outline" size="sm">
                    Delete Record
                  </Button>

                  {isColorBroken ? (
                    <button
                      type="button"
                      className="rounded-md px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs transition-colors"
                      style={{ backgroundColor: "#ef4444" }}
                    >
                      Save Changes
                    </button>
                  ) : (
                    <Button variant="primary" size="sm">
                      Save Changes
                    </Button>
                  )}
                </div>

              </div>

            </div>

          </div>

          {/* ========================================================================= */}
          {/* HEILUNGS-DETAILS & INTERAKTIVER TEST (Nur in Phase "interactive")          */}
          {/* ========================================================================= */}
          {phase === "interactive" && (
            <div className="mt-8 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              
              {/* Die 3 Heilungskarten */}
              <div>
                <h3 className="text-xs font-mono uppercase tracking-wider text-muted-foreground font-semibold mb-3 flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                  Automatisch geheilt durch das W3C Design System (Hovere zum Fokussieren):
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                  {/* Card 1 */}
                  <div
                    onMouseEnter={() => setHighlighted("color")}
                    onMouseLeave={() => setHighlighted(null)}
                    className={`rounded-xl border p-3.5 bg-card transition-all cursor-pointer ${
                      highlighted === "color"
                        ? "border-primary ring-1 ring-primary/30"
                        : "border-border/80 hover:border-border"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className="p-1 rounded bg-primary/10 text-primary">
                        <Palette className="h-3.5 w-3.5" />
                      </div>
                      <h4 className="text-xs font-bold text-foreground">1. Farb-Konsistenz</h4>
                    </div>
                    <div className="space-y-1 text-xs">
                      <div className="text-rose-500 font-mono text-[11px]">🔴 Hex #ef4444 verworfen</div>
                      <div className="text-emerald-600 dark:text-emerald-400 font-mono text-[11px]">🟢 Deep Violet Token aktiv</div>
                    </div>
                  </div>

                  {/* Card 2 */}
                  <div
                    onMouseEnter={() => setHighlighted("grid")}
                    onMouseLeave={() => setHighlighted(null)}
                    className={`rounded-xl border p-3.5 bg-card transition-all cursor-pointer ${
                      highlighted === "grid"
                        ? "border-primary ring-1 ring-primary/30"
                        : "border-border/80 hover:border-border"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className="p-1 rounded bg-blue-500/10 text-blue-500">
                        <Ruler className="h-3.5 w-3.5" />
                      </div>
                      <h4 className="text-xs font-bold text-foreground">2. Layout-Gitter</h4>
                    </div>
                    <div className="space-y-1 text-xs">
                      <div className="text-rose-500 font-mono text-[11px]">🔴 13px Willkür begradigt</div>
                      <div className="text-emerald-600 dark:text-emerald-400 font-mono text-[11px]">🟢 16px (--space-md)</div>
                    </div>
                  </div>

                  {/* Card 3 */}
                  <div
                    onMouseEnter={() => setHighlighted("a11y")}
                    onMouseLeave={() => setHighlighted(null)}
                    className={`rounded-xl border p-3.5 bg-card transition-all cursor-pointer ${
                      highlighted === "a11y"
                        ? "border-primary ring-1 ring-primary/30"
                        : "border-border/80 hover:border-border"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className="p-1 rounded bg-amber-500/10 text-amber-500">
                        <Eye className="h-3.5 w-3.5" />
                      </div>
                      <h4 className="text-xs font-bold text-foreground">3. Barrierefreiheit</h4>
                    </div>
                    <div className="space-y-1 text-xs">
                      <div className="text-rose-500 font-mono text-[11px]">🔴 Nacktes Input ohne Label</div>
                      <div className="text-emerald-600 dark:text-emerald-400 font-mono text-[11px]">🟢 FormField gebunden</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Interaktive Sabotage Sandbox */}
              <div className="rounded-xl border border-border/80 bg-muted/20 p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2.5">
                  <div>
                    <h3 className="text-xs font-bold text-foreground uppercase tracking-wider font-mono flex items-center gap-1.5">
                      <Zap className="h-3.5 w-3.5 text-primary" />
                      Probier es selbst aus (Live Sabotage):
                    </h3>
                  </div>

                  {(sabotageColor || sabotageLabel) && (
                    <button
                      onClick={() => {
                        setSabotageColor(false)
                        setSabotageLabel(false)
                      }}
                      className="text-xs font-mono text-primary hover:underline flex items-center gap-1"
                    >
                      <RotateCcw className="h-3 w-3" />
                      Fehler zurücksetzen
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSabotageColor((prev) => !prev)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-mono font-medium transition-all border ${
                      sabotageColor
                        ? "bg-rose-500/15 border-rose-500/40 text-rose-600 dark:text-rose-400 font-bold shadow-xs"
                        : "bg-card border-border/80 text-foreground hover:bg-muted"
                    }`}
                  >
                    {sabotageColor ? "⚡ [Farbe sabotiert: #ef4444]" : "⚡ Button-Farbe sabotieren (#ef4444)"}
                  </button>

                  <button
                    onClick={() => setSabotageLabel((prev) => !prev)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-mono font-medium transition-all border ${
                      sabotageLabel
                        ? "bg-rose-500/15 border-rose-500/40 text-rose-600 dark:text-rose-400 font-bold shadow-xs"
                        : "bg-card border-border/80 text-foreground hover:bg-muted"
                    }`}
                  >
                    {sabotageLabel ? "⚡ [Label entfernt: Nacktes Input]" : "⚡ Input-Label entfernen (A11y-Bruch)"}
                  </button>
                </div>
              </div>

            </div>
          )}

        </div>
      )}

    </div>
  )
}
