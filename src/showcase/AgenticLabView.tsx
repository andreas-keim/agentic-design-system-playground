import { useState } from "react"
import {
  ShieldCheck,
  AlertTriangle,
  Zap,
  Palette,
  Ruler,
  Eye,
  RotateCcw,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { FormField } from "@/components/ui/form-field"

type GuardrailState = "ungoverned" | "governed"
type HighlightTarget = "color" | "grid" | "a11y" | null

export function AgenticLabView() {
  // Main state: "ungoverned" (Red) vs "governed" (Green)
  const [state, setState] = useState<GuardrailState>("ungoverned")

  // Interactive sabotage toggles (active when testing manually)
  const [sabotageColor, setSabotageColor] = useState(false)
  const [sabotageLabel, setSabotageLabel] = useState(false)

  // Interactive hover/click focus from the 3 explanation cards
  const [highlighted, setHighlighted] = useState<HighlightTarget>(null)

  // Computed visual properties based on state & manual sabotage
  const isColorBroken = state === "ungoverned" || sabotageColor
  const isLabelBroken = state === "ungoverned" || sabotageLabel
  const isGridBroken = state === "ungoverned"

  function applyGuardrails() {
    setState("governed")
    setSabotageColor(false)
    setSabotageLabel(false)
    setHighlighted(null)
  }

  function resetToUngoverned() {
    setState("ungoverned")
    setSabotageColor(false)
    setSabotageLabel(false)
    setHighlighted(null)
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      
      {/* 1. Header: Kristallklarer Kontext ohne Tech-Jargon */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary font-mono uppercase tracking-wider mb-3">
          <Zap className="h-3.5 w-3.5" />
          Live Showcase • Agentic UI Lab
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
          Was passiert, wenn KI ohne Design System codet?
        </h1>
        <p className="mt-2 text-sm text-muted-foreground max-w-xl mx-auto leading-relaxed">
          Frei laufende LLMs halluzinieren willkürliche Hex-Farben, zerschlagen Layout-Raster und vergessen Barrierefreiheit. 
          Unser System fängt den Code deterministisch ab.
        </p>

        {/* Prompt Context Box */}
        <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-border/70 bg-card px-4 py-1.5 text-xs text-muted-foreground font-mono shadow-xs">
          <span className="text-foreground font-semibold">Prompt an KI:</span>
          <span>"Erstelle ein B2B System-Access Panel mit Rollen-Freigabe und Lösch-Aktion."</span>
        </div>
      </div>

      {/* 2. Zentraler 2-Stufen-Hauptschalter */}
      <div className="flex justify-center mb-8">
        <div className="inline-flex p-1 rounded-xl bg-muted/80 border border-border/80 shadow-xs">
          <button
            onClick={resetToUngoverned}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs sm:text-sm font-semibold transition-all ${
              state === "ungoverned"
                ? "bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30 shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <AlertTriangle className="h-4 w-4" />
            <span>Ohne Guardrails (KI-Chaos)</span>
          </button>

          <button
            onClick={applyGuardrails}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs sm:text-sm font-semibold transition-all ${
              state === "governed"
                ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <ShieldCheck className="h-4 w-4" />
            <span>Mit Design System (Geheilt)</span>
          </button>
        </div>
      </div>

      {/* 3. DIE ZENTRALE BÜHNE (STAGE) */}
      <div className="relative rounded-2xl border border-border/80 bg-card shadow-sm overflow-hidden mb-8">
        
        {/* Stage Header Info */}
        <div className="flex items-center justify-between border-b border-border/60 px-5 py-3 bg-muted/20 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span
              className={`h-2 w-2 rounded-full ${
                state === "governed" && !sabotageColor && !sabotageLabel
                  ? "bg-emerald-500 animate-pulse"
                  : "bg-rose-500 animate-pulse"
              }`}
            />
            <span className="font-semibold text-foreground">
              {state === "ungoverned" ? "Ungoverned LLM Output (Fehlerhaft)" : "W3C Token Governed (Produktionsreif)"}
            </span>
          </div>

          <span className="text-muted-foreground">
            {state === "ungoverned" ? "3 Regelverstöße aktiv" : "100% WCAG & Token Compliant"}
          </span>
        </div>

        {/* Stage Canvas Area */}
        <div className="p-6 sm:p-10 flex flex-col items-center justify-center bg-muted/15 dark:bg-muted/5 min-h-[380px]">
          
          <div className="w-full max-w-md bg-card rounded-xl border border-border/80 p-6 shadow-xs relative transition-all">
            
            {/* Header des Access Panels */}
            <div className="border-b border-border/60 pb-3 mb-4">
              <h2 className="text-sm font-bold text-foreground tracking-tight">
                System Access &amp; Role Configuration
              </h2>
              <p className="text-xs text-muted-foreground">
                Cluster node: <code className="font-mono text-[11px]">k8s-prod-eu-central-1</code>
              </p>
            </div>

            {/* Input-Bereich (Hier entscheidet sich Label vs. Naked Input) */}
            <div
              className={`relative transition-all rounded-lg p-1 ${
                highlighted === "a11y" ? "ring-2 ring-primary/50 bg-primary/5" : ""
              }`}
            >
              {/* Callout-Pin: NUR sichtbar im fehlerhaften Zustand */}
              {isLabelBroken && (
                <div className="absolute -top-3.5 right-2 z-20 rounded bg-rose-600 text-white font-mono text-[10px] px-2 py-0.5 shadow-sm font-semibold flex items-center gap-1 animate-bounce">
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

            {/* Layout-Abstand (13px Willkür vs 16px Design-Token) */}
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

            {/* Button-Leiste (Farb-Sünde vs. echtes Brand Token) */}
            <div
              className={`relative pt-3 border-t border-border/60 flex items-center justify-between transition-all rounded-lg p-1 ${
                highlighted === "color" ? "ring-2 ring-primary/50 bg-primary/5" : ""
              }`}
            >
              {/* Callout-Pin für Farbe: NUR sichtbar im fehlerhaften Zustand */}
              {isColorBroken && (
                <div className="absolute -top-3 left-2 z-20 rounded bg-rose-600 text-white font-mono text-[10px] px-2 py-0.5 shadow-sm font-semibold flex items-center gap-1">
                  <span>🔴 Hardcoded Hex #ef4444 (ignoriert Dark Mode)</span>
                </div>
              )}

              {/* Sekundäre Aktion */}
              <Button variant="outline" size="sm">
                Delete Record
              </Button>

              {/* Primäre Aktion: Entweder rot-gehackt oder edles Deep Violet */}
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

          {/* Aufforderung zum Heilen im fehlerhaften Zustand */}
          {state === "ungoverned" && (
            <div className="mt-6 text-center">
              <Button
                variant="primary"
                onClick={applyGuardrails}
                className="gap-2 font-semibold shadow-md px-6 py-2.5 text-sm"
              >
                <ShieldCheck className="h-4 w-4" />
                Guardrails anwenden (Alles reparieren)
              </Button>
            </div>
          )}

        </div>

      </div>

      {/* 4. DIE 3 HEILUNGS-KARTEN (Was das Design System repariert hat) */}
      <div className="mb-8">
        <h3 className="text-xs font-mono uppercase tracking-wider text-muted-foreground font-semibold mb-3">
          Die 3 Heilungs-Schritte (Hovere über eine Karte, um sie oben zu fokussieren):
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Card 1: Farbe & Theme */}
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
            <div className="space-y-1.5 text-xs">
              <div className="flex items-start gap-1.5 text-rose-500 font-mono text-[11px]">
                <span>🔴</span>
                <span>Hex <code className="bg-rose-500/10 px-1 rounded">#ef4444</code> zerstört Dark Mode</span>
              </div>
              <div className="flex items-start gap-1.5 text-emerald-600 dark:text-emerald-400 font-mono text-[11px]">
                <span>🟢</span>
                <span>Deep Violet Token gebunden</span>
              </div>
              <p className="text-[11px] text-muted-foreground pt-1 border-t border-border/50">
                Garantierter Kontrast und nahtloses Theme-Switching.
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
            <div className="space-y-1.5 text-xs">
              <div className="flex items-start gap-1.5 text-rose-500 font-mono text-[11px]">
                <span>🔴</span>
                <span><code className="bg-rose-500/10 px-1 rounded">13px</code> bricht 8px-Skala</span>
              </div>
              <div className="flex items-start gap-1.5 text-emerald-600 dark:text-emerald-400 font-mono text-[11px]">
                <span>🟢</span>
                <span>Exakt 16px (<code className="text-[10px]">--space-md</code>)</span>
              </div>
              <p className="text-[11px] text-muted-foreground pt-1 border-t border-border/50">
                Verhindert Subpixel-Flimmern und asymmetrisches Springen.
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
            <div className="space-y-1.5 text-xs">
              <div className="flex items-start gap-1.5 text-rose-500 font-mono text-[11px]">
                <span>🔴</span>
                <span>Nacktes Input (Screenreader stumm)</span>
              </div>
              <div className="flex items-start gap-1.5 text-emerald-600 dark:text-emerald-400 font-mono text-[11px]">
                <span>🟢</span>
                <span><code className="text-[10px]">&lt;FormField label="..."&gt;</code></span>
              </div>
              <p className="text-[11px] text-muted-foreground pt-1 border-t border-border/50">
                Erfüllt WCAG 2.2 AA Kriterien (Sichtbare & verknüpfte Labels).
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* 5. INTERAKTIVER STRESSTEST: Live-Sabotage mit echter optischer Reaktion */}
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
  )
}
