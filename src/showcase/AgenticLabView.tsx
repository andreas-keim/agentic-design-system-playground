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

type CinematicStep = "hook" | "reveal" | "prompt" | "clash" | "healed"
type HighlightTarget = "color" | "grid" | "a11y" | null

const PROMPT_TEXT = "Erstelle ein B2B System-Access Panel mit Rollen-Freigabe und Lösch-Aktion."

export function AgenticLabView() {
  // Cinematic Timeline State
  const [step, setStep] = useState<CinematicStep>("hook")
  const [typedPrompt, setTypedPrompt] = useState("")
  const [isScanning, setIsScanning] = useState(false)

  // Manual interactive toggles (available after film ends)
  const [sabotageColor, setSabotageColor] = useState(false)
  const [sabotageLabel, setSabotageLabel] = useState(false)
  const [highlighted, setHighlighted] = useState<HighlightTarget>(null)

  // Timer reference to allow cancel / skip
  const timeoutsRef = useRef<NodeJS.Timeout[]>([])

  function clearAllTimers() {
    timeoutsRef.current.forEach(clearTimeout)
    timeoutsRef.current = []
  }

  // Run the Cinematic Director
  function startFilm() {
    clearAllTimers()
    setStep("hook")
    setTypedPrompt("")
    setIsScanning(false)
    setSabotageColor(false)
    setSabotageLabel(false)
    setHighlighted(null)

    // Step 1: Hook is active immediately (0s)

    // Step 2: Reveal Problem Statement (1.1s)
    const t1 = setTimeout(() => {
      setStep("reveal")
    }, 1100)

    // Step 3: Enter Command Bar & Type Prompt (2.4s)
    const t2 = setTimeout(() => {
      setStep("prompt")
      typePromptLetter(0)
    }, 2400)

    timeoutsRef.current.push(t1, t2)
  }

  // Typewriter Engine with natural rhythm
  function typePromptLetter(index: number) {
    if (index <= PROMPT_TEXT.length) {
      setTypedPrompt(PROMPT_TEXT.slice(0, index))
      const delay = index === PROMPT_TEXT.length ? 450 : 22 + Math.random() * 18
      const t = setTimeout(() => typePromptLetter(index + 1), delay)
      timeoutsRef.current.push(t)
    } else {
      // Prompt finished -> trigger clash (ungoverned hallucination)
      const tClash = setTimeout(() => {
        setStep("clash")
        triggerGuardrailRemediation()
      }, 500)
      timeoutsRef.current.push(tClash)
    }
  }

  // Guardrail Scanner & Remediation
  function triggerGuardrailRemediation() {
    // Show chaotic clash for 1.3s, then start scanning
    const tScan = setTimeout(() => {
      setIsScanning(true)
    }, 1300)

    // After scanning finishes, morph into healed state
    const tHeal = setTimeout(() => {
      setIsScanning(false)
      setStep("healed")
    }, 2500)

    timeoutsRef.current.push(tScan, tHeal)
  }

  // Skip straight to the end
  function skipToEnd() {
    clearAllTimers()
    setStep("healed")
    setTypedPrompt(PROMPT_TEXT)
    setIsScanning(false)
    setSabotageColor(false)
    setSabotageLabel(false)
  }

  // Start film on mount
  useEffect(() => {
    startFilm()
    return () => clearAllTimers()
  }, [])

  // Derived visual states
  const isUngovernedVisual = step === "clash"
  const isColorBroken = (isUngovernedVisual && !isScanning) || sabotageColor
  const isLabelBroken = (isUngovernedVisual && !isScanning) || sabotageLabel
  const isGridBroken = isUngovernedVisual && !isScanning

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      
      {/* Top Film Controls Bar */}
      <div className="flex items-center justify-between mb-8 pb-3 border-b border-border/60">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-primary animate-ping" />
          <span className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
            {step !== "healed" ? "Cinematic Walkthrough (Live)" : "Interactive Mode Active"}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {step !== "healed" ? (
            <button
              onClick={skipToEnd}
              className="flex items-center gap-1.5 rounded-full bg-muted/60 px-3 py-1 text-xs font-mono text-muted-foreground hover:text-foreground transition-colors"
            >
              <FastForward className="h-3 w-3" />
              <span>Überspringen</span>
            </button>
          ) : (
            <button
              onClick={startFilm}
              className="flex items-center gap-1.5 rounded-full bg-primary/10 border border-primary/20 px-3.5 py-1 text-xs font-mono font-semibold text-primary hover:bg-primary/20 transition-all shadow-xs"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Film erneut abspielen</span>
            </button>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SCENE 1 & 2: THE HOOK & THE REVEAL                                        */}
      {/* ========================================================================= */}
      <div className="text-center mb-8 min-h-[140px] flex flex-col justify-center">
        {/* Act 1: The Giant Question */}
        <h1
          className={`text-2xl sm:text-4xl font-extrabold tracking-tight text-foreground transition-all duration-700 ease-out ${
            step === "hook" ? "scale-105 text-primary" : "scale-100"
          }`}
        >
          Was passiert, wenn KI ohne Design System codet?
        </h1>

        {/* Act 2: The Problem Revealed */}
        <p
          className={`mt-4 text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed transition-all duration-700 ease-out ${
            step !== "hook"
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-3 pointer-events-none"
          }`}
        >
          Frei laufende LLMs halluzinieren willkürliche Hex-Farben, zerschlagen Layout-Raster und vergessen Barrierefreiheit. 
          <span className="text-foreground font-semibold"> Unser System fängt den Code deterministisch ab.</span>
        </p>
      </div>

      {/* ========================================================================= */}
      {/* SCENE 3: THE COMMAND BAR / LIVE PROMPT TYPEWRITER                         */}
      {/* ========================================================================= */}
      <div
        className={`mb-8 transition-all duration-500 ease-out ${
          step !== "hook" && step !== "reveal"
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-4 pointer-events-none"
        }`}
      >
        <div className="w-full max-w-2xl mx-auto rounded-xl border border-border/90 bg-card p-3.5 shadow-md font-mono text-xs">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-border/50 text-muted-foreground text-[10px]">
            <div className="flex items-center gap-1.5">
              <Terminal className="h-3.5 w-3.5 text-primary" />
              <span className="font-semibold text-foreground">AI Coding Agent CLI</span>
            </div>
            <span className="bg-muted px-2 py-0.5 rounded text-[10px]">
              {step === "prompt" ? "Typing prompt..." : step === "clash" ? "Synthesizing UI..." : "Guardrail Verified"}
            </span>
          </div>

          <div className="flex items-center text-foreground font-mono text-xs sm:text-sm">
            <span className="text-primary font-bold mr-2">❯</span>
            <span className="tracking-tight">{typedPrompt}</span>
            {step === "prompt" && (
              <span className="inline-block w-2 h-4 bg-primary ml-1 animate-pulse" />
            )}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SCENE 4 & 5: THE STAGE (CLASH ➔ SCANNER ➔ HEALED)                        */}
      {/* ========================================================================= */}
      <div
        className={`transition-all duration-700 ease-out ${
          step === "clash" || step === "healed"
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-6 pointer-events-none"
        }`}
      >
        <div className="relative rounded-2xl border border-border/80 bg-card shadow-lg overflow-hidden mb-8">
          
          {/* Stage Top Bar */}
          <div className="flex items-center justify-between border-b border-border/60 px-5 py-3 bg-muted/20 text-xs font-mono">
            <div className="flex items-center gap-2">
              <span
                className={`h-2.5 w-2.5 rounded-full ${
                  isScanning
                    ? "bg-amber-500 animate-ping"
                    : isColorBroken || isLabelBroken
                    ? "bg-rose-500 animate-pulse"
                    : "bg-emerald-500"
                }`}
              />
              <span className="font-semibold text-foreground">
                {isScanning
                  ? "🛡️ Design System Guardrails actively compiling..."
                  : isColorBroken || isLabelBroken
                  ? "⚠️ Ungoverned LLM Output (3 Hallucinations)"
                  : "✓ W3C Token Governed (Production Ready)"}
              </span>
            </div>

            <span className="text-muted-foreground text-[11px]">
              {isScanning ? "AST AST Transform: < 2ms" : step === "healed" ? "100% WCAG AA • 0% Debt" : "Rejected by Schema"}
            </span>
          </div>

          {/* Glowing Scanner Line Overlay during transformation */}
          {isScanning && (
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent z-40 animate-pulse shadow-[0_0_15px_#7c3aed]" />
          )}

          {/* Visual Canvas Area */}
          <div className="p-6 sm:p-12 flex flex-col items-center justify-center bg-muted/15 dark:bg-muted/5 min-h-[380px] relative">
            
            {/* The Actual Component Card */}
            <div
              className={`w-full max-w-md bg-card rounded-xl border p-6 shadow-sm relative transition-all duration-500 ${
                isColorBroken || isLabelBroken
                  ? "border-rose-500/80 shadow-rose-500/10 ring-1 ring-rose-500/30"
                  : "border-border/80"
              }`}
            >
              {/* Header */}
              <div className="border-b border-border/60 pb-3 mb-4">
                <h2 className="text-sm font-bold text-foreground tracking-tight">
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
                {/* Visual Pin: ONLY visible in broken state */}
                {isLabelBroken && (
                  <div className="absolute -top-3.5 right-2 z-20 rounded bg-rose-600 text-white font-mono text-[10px] px-2 py-0.5 shadow-sm font-semibold flex items-center gap-1">
                    <span>🔴 A11y-Fehler: Nacktes Input (kein Label)</span>
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
                {/* Visual Pin: ONLY visible in broken state */}
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
        {/* THE 3 HEALING CARDS (Active in Healed State)                              */}
        {/* ========================================================================= */}
        <div className="mb-8">
          <h3 className="text-xs font-mono uppercase tracking-wider text-muted-foreground font-semibold mb-3 flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
            Automatisch geheilt durch das W3C Design System:
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Card 1: Farbe */}
            <div
              onMouseEnter={() => setHighlighted("color")}
              onMouseLeave={() => setHighlighted(null)}
              className={`rounded-xl border p-4 bg-card transition-all cursor-pointer ${
                highlighted === "color"
                  ? "border-primary shadow-xs ring-1 ring-primary/30"
                  : "border-border/80 hover:border-border"
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                  <Palette className="h-4 w-4" />
                </div>
                <h4 className="text-xs font-bold text-foreground">1. Farb-Konsistenz</h4>
              </div>
              <div className="space-y-1 text-xs">
                <div className="text-rose-500 font-mono text-[11px]">
                  🔴 Hex <code className="bg-rose-500/10 px-1 rounded">#ef4444</code> verworfen
                </div>
                <div className="text-emerald-600 dark:text-emerald-400 font-mono text-[11px]">
                  🟢 Deep Violet Token gebunden
                </div>
                <p className="text-[11px] text-muted-foreground pt-1 border-t border-border/50">
                  Voller Dark-Mode-Support &amp; WCAG AA Kontrast.
                </p>
              </div>
            </div>

            {/* Card 2: 8px Raster */}
            <div
              onMouseEnter={() => setHighlighted("grid")}
              onMouseLeave={() => setHighlighted(null)}
              className={`rounded-xl border p-4 bg-card transition-all cursor-pointer ${
                highlighted === "grid"
                  ? "border-primary shadow-xs ring-1 ring-primary/30"
                  : "border-border/80 hover:border-border"
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-500">
                  <Ruler className="h-4 w-4" />
                </div>
                <h4 className="text-xs font-bold text-foreground">2. Layout-Gitter</h4>
              </div>
              <div className="space-y-1 text-xs">
                <div className="text-rose-500 font-mono text-[11px]">
                  🔴 <code className="bg-rose-500/10 px-1 rounded">13px</code> Abstand begradigt
                </div>
                <div className="text-emerald-600 dark:text-emerald-400 font-mono text-[11px]">
                  🟢 Exakt 16px (<code className="text-[10px]">--space-md</code>)
                </div>
                <p className="text-[11px] text-muted-foreground pt-1 border-t border-border/50">
                  Kein Layout-Springen oder Subpixel-Jitter.
                </p>
              </div>
            </div>

            {/* Card 3: Barrierefreiheit */}
            <div
              onMouseEnter={() => setHighlighted("a11y")}
              onMouseLeave={() => setHighlighted(null)}
              className={`rounded-xl border p-4 bg-card transition-all cursor-pointer ${
                highlighted === "a11y"
                  ? "border-primary shadow-xs ring-1 ring-primary/30"
                  : "border-border/80 hover:border-border"
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500">
                  <Eye className="h-4 w-4" />
                </div>
                <h4 className="text-xs font-bold text-foreground">3. Barrierefreiheit</h4>
              </div>
              <div className="space-y-1 text-xs">
                <div className="text-rose-500 font-mono text-[11px]">
                  🔴 Nacktes Input ohne Label
                </div>
                <div className="text-emerald-600 dark:text-emerald-400 font-mono text-[11px]">
                  🟢 <code className="text-[10px]">&lt;FormField label="..."&gt;</code>
                </div>
                <p className="text-[11px] text-muted-foreground pt-1 border-t border-border/50">
                  Programmatische Verknüpfung für Screenreader.
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* ========================================================================= */}
        {/* INTERACTIVE SABOTAGE / STRESS TEST                                       */}
        {/* ========================================================================= */}
        <div className="rounded-2xl border border-border/80 bg-muted/20 p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
            <div>
              <h3 className="text-xs font-bold text-foreground uppercase tracking-wider font-mono flex items-center gap-1.5">
                <Zap className="h-3.5 w-3.5 text-primary" />
                Interaktiver Stresstest (Live Sabotage)
              </h3>
              <p className="text-xs text-muted-foreground">
                Klicke, um einzelne Fehler zu injizieren – die Komponente oben reagiert sofort sichtbar:
              </p>
            </div>

            {(sabotageColor || sabotageLabel) && (
              <button
                onClick={() => {
                  setSabotageColor(false)
                  setSabotageLabel(false)
                }}
                className="text-xs font-mono text-primary hover:underline flex items-center gap-1 self-start sm:self-auto"
              >
                <RotateCcw className="h-3 w-3" />
                Alle Fehler zurücksetzen
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-2.5">
            <button
              onClick={() => setSabotageColor((prev) => !prev)}
              className={`rounded-lg px-3 py-1.5 text-xs font-mono font-medium transition-all border ${
                sabotageColor
                  ? "bg-rose-500/15 border-rose-500/40 text-rose-600 dark:text-rose-400 font-bold shadow-xs"
                  : "bg-card border-border/80 text-foreground hover:bg-muted"
              }`}
            >
              {sabotageColor ? "⚡ [Farbe sabotiert: #ef4444 aktiv]" : "⚡ Button-Farbe sabotieren (#ef4444)"}
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

    </div>
  )
}
