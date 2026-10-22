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
  Play,
  Pause,
  SlidersHorizontal,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { FormField } from "@/components/ui/form-field"

type CinematicPhase =
  | "title-only"       // 1. Großes Intro
  | "problem-revealed" // 2. Subtext
  | "typing-prompt"    // 3. Prompting
  | "fading-out"       // 4. Fade-Out
  | "component-clash"  // 5. KI-Chaos
  | "component-scan"   // 6. Guardrail-Scan
  | "interactive"      // 7. Geheilt & Interaktiv

type HighlightTarget = "color" | "grid" | "a11y" | null

const PROMPT_TEXT = "Erstelle ein B2B System-Access Panel mit Rollen-Freigabe und Lösch-Aktion."

const TIMELINE_STEPS: { id: CinematicPhase; label: string; num: string }[] = [
  { id: "title-only", label: "1. Hook", num: "01" },
  { id: "problem-revealed", label: "2. Problem", num: "02" },
  { id: "typing-prompt", label: "3. Prompt", num: "03" },
  { id: "fading-out", label: "4. Fade Out", num: "04" },
  { id: "component-clash", label: "5. KI-Chaos", num: "05" },
  { id: "component-scan", label: "6. Guardrail", num: "06" },
  { id: "interactive", label: "7. Geheilt", num: "07" },
]

export function AgenticLabView() {
  const [phase, setPhase] = useState<CinematicPhase>("title-only")
  const [typedPrompt, setTypedPrompt] = useState("")
  const [isPlaying, setIsPlaying] = useState(true)

  // Interactive sabotage states (available in interactive phase)
  const [sabotageColor, setSabotageColor] = useState(false)
  const [sabotageLabel, setSabotageLabel] = useState(false)
  const [highlighted, setHighlighted] = useState<HighlightTarget>(null)

  const timeoutsRef = useRef<NodeJS.Timeout[]>([])

  function clearAllTimers() {
    timeoutsRef.current.forEach(clearTimeout)
    timeoutsRef.current = []
  }

  // Jump directly to any phase in the timeline (for manual inspection)
  function jumpToPhase(target: CinematicPhase, continueAutoplay = false) {
    clearAllTimers()
    setPhase(target)

    if (target === "title-only") {
      setTypedPrompt("")
    } else if (target === "problem-revealed") {
      setTypedPrompt("")
    } else if (target === "typing-prompt") {
      setTypedPrompt("Erstelle ein B2B System-Access Panel...")
    } else {
      setTypedPrompt(PROMPT_TEXT)
    }

    if (!continueAutoplay) {
      setIsPlaying(false)
    }
  }

  // Cinematic Director with Autoplay
  function runCinematicFromCurrent() {
    clearAllTimers()
    setIsPlaying(true)
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
      const tFade = setTimeout(() => {
        setPhase("fading-out")
        transitionToComponentStage()
      }, 700)
      timeoutsRef.current.push(tFade)
    }
  }

  function transitionToComponentStage() {
    const tClash = setTimeout(() => {
      setPhase("component-clash")
    }, 700)

    const tScan = setTimeout(() => {
      setPhase("component-scan")
    }, 2400)

    const tInteractive = setTimeout(() => {
      setPhase("interactive")
      setIsPlaying(false)
    }, 3800)

    timeoutsRef.current.push(tClash, tScan, tInteractive)
  }

  // Start on initial mount
  useEffect(() => {
    runCinematicFromCurrent()
    return () => clearAllTimers()
  }, [])

  // Derived states
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
    <div className="relative min-h-[calc(100vh-120px)] flex flex-col justify-between px-4 py-4 sm:px-8 max-w-6xl mx-auto">
      
      {/* ========================================================================= */}
      {/* DEV TIMELINE TOOLBAR (Zum Testen & schnellen Hin- und Herspringen)         */}
      {/* ========================================================================= */}
      <div className="w-full mb-6 z-50">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-2xl border border-border/80 bg-card/90 backdrop-blur-md p-2.5 sm:px-4 shadow-sm">
          
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 font-mono text-[11px] font-semibold uppercase tracking-wider text-primary">
              <SlidersHorizontal className="h-3.5 w-3.5" />
              <span>Director Timeline</span>
            </span>

            {/* Play/Pause Toggle */}
            <button
              onClick={() => {
                if (isPlaying) {
                  clearAllTimers()
                  setIsPlaying(false)
                } else {
                  runCinematicFromCurrent()
                }
              }}
              className="flex items-center gap-1 rounded-md bg-muted px-2.5 py-1 text-xs font-mono text-foreground hover:bg-muted/80 transition-all ml-1"
              title={isPlaying ? "Pause Timeline" : "Play Timeline"}
            >
              {isPlaying ? (
                <>
                  <Pause className="h-3 w-3 text-amber-500 fill-amber-500" />
                  <span>Pause</span>
                </>
              ) : (
                <>
                  <Play className="h-3 w-3 text-emerald-500 fill-emerald-500" />
                  <span>Play</span>
                </>
              )}
            </button>

            <button
              onClick={runCinematicFromCurrent}
              className="p-1 rounded text-muted-foreground hover:text-foreground transition-colors"
              title="Replay from start"
            >
              <RotateCcw className="h-3 w-3" />
            </button>
          </div>

          {/* Scrubber Steps */}
          <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto p-0.5 bg-muted/60 rounded-xl border border-border/60">
            {TIMELINE_STEPS.map((s) => (
              <button
                key={s.id}
                onClick={() => jumpToPhase(s.id, false)}
                className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-mono transition-all shrink-0 ${
                  phase === s.id
                    ? "bg-primary text-primary-foreground font-bold shadow-xs"
                    : "text-muted-foreground hover:text-foreground hover:bg-card/60"
                }`}
              >
                <span className="opacity-60 text-[10px]">{s.num}</span>
                <span>{s.label}</span>
              </button>
            ))}
          </div>

          {/* Quick Skip to Final */}
          <button
            onClick={() => jumpToPhase("interactive", false)}
            className="hidden lg:flex items-center gap-1 text-[11px] font-mono text-muted-foreground hover:text-foreground transition-colors"
          >
            <FastForward className="h-3 w-3" />
            <span>Ende</span>
          </button>

        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. CINEMATIC INTRO: GROSS & BILDSHIRM-ZENTRIERT (Content Width erhöht)    */}
      {/* ========================================================================= */}
      {isIntroActive && (
        <div
          className={`flex-1 flex flex-col items-center justify-center text-center px-4 transition-all duration-700 ease-out ${
            phase === "fading-out"
              ? "opacity-0 -translate-y-12 scale-95 pointer-events-none"
              : "opacity-100 translate-y-0 scale-100"
          }`}
        >
          {/* Großes Kinoleinwand-Typografie (bis zu text-7xl) */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-foreground leading-[1.1] max-w-5xl">
            Was passiert, wenn KI ohne Design System codet?
          </h1>

          {/* Subtext: Ruhig & Klar */}
          <p
            className={`mt-8 text-lg sm:text-2xl text-muted-foreground max-w-3xl leading-relaxed transition-all duration-700 ease-out ${
              phase !== "title-only"
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-6"
            }`}
          >
            Frei laufende LLMs halluzinieren willkürliche Hex-Farben, zerschlagen Layout-Raster und vergessen Barrierefreiheit. 
            <span className="text-foreground font-semibold"> Unser System fängt den Code deterministisch ab.</span>
          </p>

          {/* Großes Terminal-Promptfeld (max-w-2xl) */}
          <div
            className={`mt-10 w-full max-w-2xl transition-all duration-500 ease-out ${
              phase === "typing-prompt" || phase === "fading-out"
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-6 pointer-events-none"
            }`}
          >
            <div className="rounded-2xl border border-border/90 bg-card p-5 shadow-2xl text-left font-mono">
              <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-border/50 text-muted-foreground text-xs">
                <div className="flex items-center gap-2">
                  <Terminal className="h-4 w-4 text-primary" />
                  <span className="font-semibold text-foreground">AI Coding Agent CLI</span>
                </div>
                <span className="bg-muted px-2 py-0.5 rounded text-[11px]">
                  Simulating Prompt
                </span>
              </div>

              <div className="flex items-center text-foreground font-mono text-sm sm:text-base py-1">
                <span className="text-primary font-bold mr-2.5">❯</span>
                <span className="tracking-tight">{typedPrompt}</span>
                <span className="inline-block w-2.5 h-5 bg-primary ml-1.5 animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. DIE KOMPONENTEN-BÜHNE: 100% FOKUS (Breiter & Zentrierter)              */}
      {/* ========================================================================= */}
      {isComponentStageActive && (
        <div className="flex-1 flex flex-col justify-center max-w-4xl mx-auto w-full animate-in fade-in zoom-in-95 duration-700">
          
          {/* Status Label */}
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
              <span className="font-mono text-xs sm:text-sm font-semibold text-foreground">
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
              <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-transparent via-primary to-transparent z-40 animate-pulse shadow-[0_0_25px_#7c3aed]" />
            )}

            <div className="p-8 sm:p-14 flex flex-col items-center justify-center bg-muted/15 dark:bg-muted/5 min-h-[380px]">
              
              {/* Die eigentliche Komponente (Breite erhöht auf max-w-lg) */}
              <div
                className={`w-full max-w-lg bg-card rounded-xl border p-6 sm:p-8 shadow-sm relative transition-all duration-500 ${
                  isBrokenUI
                    ? "border-rose-500/80 shadow-rose-500/10 ring-2 ring-rose-500/30"
                    : "border-border/80"
                }`}
              >
                {/* Header */}
                <div className="border-b border-border/60 pb-3.5 mb-4">
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
                        className="w-full rounded border border-rose-400 dark:border-rose-600/60 bg-background px-3 py-2 text-xs sm:text-sm text-foreground outline-none"
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
                      className="rounded-md px-4 py-1.5 text-xs sm:text-sm font-semibold text-white shadow-xs transition-colors"
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
          {/* HEILUNGS-DETAILS & INTERAKTIVER TEST                                      */}
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

      {/* Leeres Element für sauberes Layout-Spacing */}
      <div className="h-4" />

    </div>
  )
}
