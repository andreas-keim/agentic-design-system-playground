import { useState, useEffect } from "react"
import {
  ArrowRight,
  ArrowDown,
  Code2,
  Terminal,
} from "lucide-react"
import { useShowcase } from "./ShowcaseContext"
import { PageHeader } from "./PageHeader"

type StationId =
  | "w3c-tokens"
  | "style-dictionary"
  | "css-vars"
  | "react-components"
  | "agent-payload"
  | "catalog-contract"
  | "validation-gate"
  | "verdict"

interface ArchitectureStation {
  id: StationId
  pathway: "build" | "agent"
  stepNumber: string
  title: string
  artifact: string
  function: string
  role: string
  connectionLabel: string
  inputDescription: string
  outputDescription: string
  adrTag?: string
  adrDecision?: string
  sourceFile: string
  codeSnippet: {
    language: string
    title: string
    isSimplified?: boolean
    code: string
  }
}

const ARCHITECTURE_STATIONS: ArchitectureStation[] = [
  // --- PFAD 1: BUILD-PIPELINE (Statische Generierung) ---
  {
    id: "w3c-tokens",
    pathway: "build",
    stepNumber: "B1",
    title: "W3C Design Tokens",
    artifact: "tokens.json",
    function: "Single Source of Truth im DTCG-Format",
    role: "Single Source of Truth im W3C DTCG Format ($value, $type)",
    connectionLabel: "Build via Style Dictionary",
    inputDescription: "src/tokens/tokens.json mit Primitives (colors.*) und Semantic Aliases (color.*)",
    outputDescription: "DTCG JSON mit Verwendungsregeln (useFor, avoidFor) für Design und Code",
    adrTag: "ADR-04 // W3C DTCG Governance",
    adrDecision:
      "Strikte Trennung von Primitives und Semantics. Keine festen Hex-Codes im Komponenten-Code.",
    sourceFile: "src/tokens/tokens.json",
    codeSnippet: {
      language: "json",
      title: "src/tokens/tokens.json (Echter Auszug)",
      code: `{
  "colors": {
    "violet": {
      "700": { "$value": "#6d28d9", "$type": "color" }
    }
  },
  "color": {
    "background": {
      "primary": {
        "default": {
          "$value": "{colors.violet.700}",
          "$type": "color",
          "useFor": "Haupt-Aktion in einem Flow, primärer CTA",
          "avoidFor": "dekorative Flächen, sekundäre/tertiäre Aktionen"
        }
      }
    }
  }
}`,
    },
  },
  {
    id: "style-dictionary",
    pathway: "build",
    stepNumber: "B2",
    title: "Style Dictionary",
    artifact: "style-dictionary.config.js",
    function: "Kompiliert CSS-Variablen & Figma-JSON",
    role: "Automatisierter Token-Transformer für CSS und Figma",
    connectionLabel: "Kompiliert CSS & Figma-JSON",
    inputDescription: "style-dictionary.config.js liest src/tokens/tokens.json",
    outputDescription: "Generiert src/styles/tokens.css und src/tokens/tokens.figma.json (keine TS-Typen)",
    adrTag: "Build-Automatisierung",
    adrDecision: "Plattformübergreifender Sync: Web Custom Properties und Figma Variable Scopes aus einer Quelle.",
    sourceFile: "style-dictionary.config.js",
    codeSnippet: {
      language: "javascript",
      title: "style-dictionary.config.js (Echter Auszug)",
      code: `export default {
  source: ['src/tokens/tokens.json'],
  platforms: {
    css: {
      transformGroup: 'css',
      buildPath: 'src/styles/',
      files: [{ destination: 'tokens.css', format: 'css/variables' }],
    },
    figma: {
      transforms: ['name/pathToFigma'],
      buildPath: 'src/tokens/',
      files: [{ destination: 'tokens.figma.json', format: 'figma/variables-json' }],
    },
  },
};`,
    },
  },
  {
    id: "css-vars",
    pathway: "build",
    stepNumber: "B3",
    title: "CSS-Variablen",
    artifact: "tokens.css",
    function: "Zero-Runtime Tokenbindung im Web",
    role: "Generierte Design-Tokens für Browser und Design-Tool",
    connectionLabel: "Bindung in Component Styles",
    inputDescription: "Automatisch generiert aus Style Dictionary Build",
    outputDescription: ":root CSS Custom Properties (--color-background-primary-default) & Figma JSON",
    adrTag: "Zero-Runtime CSS",
    adrDecision: "Kein CSS-in-JS Overhead; schlanke CSS-Variablen nutzbar mit Tailwind v4.",
    sourceFile: "src/styles/tokens.css",
    codeSnippet: {
      language: "css",
      title: "src/styles/tokens.css (Echter Auszug)",
      code: `/**
 * Do not edit directly, this file was auto-generated.
 */
:root {
  --colors-violet-700: #6d28d9;
  --color-background-primary-default: #6d28d9;
  --color-background-primary-hover: #5b21b6;
  --color-text-primary-default: #ffffff;
  --space-component-sm: 8px;
  --space-component-md: 16px;
  --radii-md: 6px;
}`,
    },
  },
  {
    id: "react-components",
    pathway: "build",
    stepNumber: "B4",
    title: "React Core UI",
    artifact: "button.tsx",
    function: "Headless Primitives (@base-ui/react)",
    role: "Headless Primitives (@base-ui/react) gebunden an Token-Klassen",
    connectionLabel: "Freigabe an A2 Katalog",
    inputDescription: "@base-ui/react/button + cva + var(--...) Token-Referenzen",
    outputDescription: "Barrierefreie Komponenten. Der Katalog (A2) gibt eine eingeschränkte Auswahl frei.",
    adrTag: "Component Foundation",
    adrDecision:
      "Headless Basis (@base-ui). Dokumentiert via button.meta.json und button.guidelines.md.",
    sourceFile: "src/components/ui/button.tsx",
    codeSnippet: {
      language: "tsx",
      title: "src/components/ui/button.tsx (Echter Auszug)",
      code: `const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-lg border text-[length:var(--font-size-md)] ...",
  {
    variants: {
      variant: {
        primary: "bg-primary text-primary-foreground hover:bg-[var(--color-background-primary-hover)]",
        outline: "border-border bg-background hover:bg-muted",
        // ...
      },
      size: {
        default: "gap-[var(--space-component-sm)] px-[var(--space-component-md)] py-[var(--space-component-sm)]",
      },
    },
  }
);`,
    },
  },

  // --- PFAD 2: AGENTIC UI GOVERNANCE (Validierung) ---
  {
    id: "agent-payload",
    pathway: "agent",
    stepNumber: "A1",
    title: "Agent-Payload",
    artifact: "fixtures.ts",
    function: "JSON-Nachrichtenstrom eines LLMs",
    role: "JSON-Nachrichtenstrom eines LLMs (A2UI Protokoll)",
    connectionLabel: "Übergabe an Schema-Validierung",
    inputDescription: "LLM erzeugt UI-Nachrichten (createSurface, updateComponents)",
    outputDescription: "Ungeprüftes Komponenten-JSON (potenziell mit unerlaubten Props oder Hex-Werten)",
    adrTag: "Input Contract",
    adrDecision: "Agents liefern keine freien JSX/HTML-Blobs, sondern strukturierte A2UI JSON-Befehle.",
    sourceFile: "src/a2ui/fixtures.ts",
    codeSnippet: {
      language: "typescript",
      title: "src/a2ui/fixtures.ts (Echter Auszug: Fall 03)",
      code: `// Fixture 03: Reale fehlerhafte Agent-Ausgabe aus dem Repository
{
  name: "03 Rohwert per className",
  note: "Agent versucht, einen Button per Tailwind-Klasse zu färben.",
  shouldBe: "rejected",
  messages: surface([
    root(["title", "submit"]),
    title,
    {
      id: "submit",
      component: "Button",
      label: "Create account",
      className: "bg-[#ff0000] text-white", // ❌ Unbekannte Eigenschaft
      action: { event: { name: "signUp", context: formContext } }
    },
  ]),
}`,
    },
  },
  {
    id: "catalog-contract",
    pathway: "agent",
    stepNumber: "A2",
    title: "Katalog & Regeln",
    artifact: "catalog.api.ts",
    function: "Strikte Whitelist per Zod .strict()",
    role: "Strikter Typen-Vertrag via Zod .strict() und Designregeln",
    connectionLabel: "Prüfung durch A2UI Processor",
    inputDescription: "Basiert auf React Core UI (B4); catalog.api.ts gibt eine eingeschränkte Auswahl für Agenten frei",
    outputDescription: "Verbindliche Whitelist: Erlaubte Varianten; verbotene Props (className, style) werfen Fehler",
    adrTag: "Whitelisted Catalog",
    adrDecision:
      "Der Katalog gibt eine eingeschränkte Auswahl der Komponenten für Agenten frei. Keine freien HTML- oder CSS-Klassen.",
    sourceFile: "src/a2ui/catalog.api.ts",
    codeSnippet: {
      language: "typescript",
      title: "src/a2ui/catalog.api.ts (Echter Auszug: Zod .strict() Schema)",
      code: `export const ButtonApi = {
  name: "Button",
  schema: z
    .object({
      ...common,
      label: CommonSchemas.DynamicString,
      variant: z
        .enum(["primary", "outline", "ghost", "destructive", "link"])
        .optional(),
      action: CommonSchemas.Action,
      checks: CommonSchemas.Checkable.shape.checks,
    })
    .strict(), // ❌ Unbekannte Props (className, style, ...) werden abgelehnt
  allowedParents: ["Column"],
};`,
    },
  },
  {
    id: "validation-gate",
    pathway: "agent",
    stepNumber: "A3",
    title: "check.ts Engine",
    artifact: "check.ts",
    function: "Deterministische Schema- & Regelprüfung",
    role: "Node-basierte Validierung (Schema-Layer + Designregeln)",
    connectionLabel: "Urteilsfindung & Übersetzung",
    inputDescription: "Node-Aufruf (node src/a2ui/check.ts) validiert 12 gezielte Fixtures gegen den Katalog",
    outputDescription: "11 von 12 gezielten Fixtures wie erwartet; 1 dokumentierte semantische Lücke (Fixture 08)",
    adrTag: "ADR-02 // Deterministische Validierung",
    adrDecision:
      "Deterministische Schema-Prüfung vor dem Rendern statt unberechenbarem Prompting.",
    sourceFile: "src/a2ui/check.ts",
    codeSnippet: {
      language: "typescript",
      title: "src/a2ui/check.ts (Echter Auszug: Validierungsschleife)",
      code: `function runSchemaLayer(messages: unknown[]): string | null {
  const catalog = new Catalog(PLAYGROUND_CATALOG_ID, "v0.9", catalogApis as never, [])
  const processor = new MessageProcessor([catalog], undefined, { validationConfig: STRICT_VALIDATION })
  try {
    processor.processMessages(messages as never)
    return null
  } catch (e) {
    return (e as Error).message.split("\\n")[0].slice(0, 400)
  }
}`,
    },
  },
  {
    id: "verdict",
    pathway: "agent",
    stepNumber: "A4",
    title: "Urteil & Korrektur",
    artifact: "explain.ts",
    function: "Freigabe oder Handlungsanweisung",
    role: "Gatekeeper: Sicheres Rendering oder Klartext-Handlungsanweisung",
    connectionLabel: "Zulassen oder Ablehnen mit Fix",
    inputDescription: "Roher Zod- oder Processor-Fehler",
    outputDescription: "Klartext-Handlungsanweisung via explain.ts an den Agenten zurück",
    adrTag: "Explainable Guardrail",
    adrDecision: "Agenten erhalten nicht nur 'Fail', sondern die exakte Handlungsanweisung zur Korrektur.",
    sourceFile: "src/a2ui/explain.ts",
    codeSnippet: {
      language: "typescript",
      title: "src/a2ui/explain.ts (Echter Auszug: Fehler-Übersetzung)",
      code: `export function explain(raw: string): Explanation | null {
  let m = raw.match(/Unrecognized key\\(s\\) in object: '([^']+)'/)
  if (m) {
    const [, key] = m
    return {
      why: \`Die Eigenschaft '\${key}' gibt es im Katalog nicht. Der Agent darf keine Stile oder Klassen setzen, nur Bausteine und Varianten.\`,
      fix: "Eine vorhandene Variante wählen, zum Beispiel variant: primary.",
    }
  }
  // ...
}`,
    },
  },
]

export function SpecsView() {
  const { setActiveTab } = useShowcase()
  const [selectedStationId, setSelectedStationId] = useState<StationId | null>(null)
  const [showCode, setShowCode] = useState<boolean>(false)

  useEffect(() => {
    const scrollAndFocus = () => {
      if (window.location.hash === "#testfall-03") {
        const el = document.getElementById("testfall-03")
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "start" })
          el.focus({ preventScroll: true })
        }
      }
    }

    scrollAndFocus()
    const raf = requestAnimationFrame(scrollAndFocus)
    const timer = setTimeout(scrollAndFocus, 100)

    window.addEventListener("hashchange", scrollAndFocus)

    return () => {
      cancelAnimationFrame(raf)
      clearTimeout(timer)
      window.removeEventListener("hashchange", scrollAndFocus)
    }
  }, [])

  const activeStation = selectedStationId
    ? ARCHITECTURE_STATIONS.find((s) => s.id === selectedStationId) ?? null
    : null

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      {/* 1. STANDARDIZIERTER PAGE HEADER */}
      <PageHeader
        title="So prüft das System Agenten-Ausgaben"
        subtitle="Wie Andreas Design Tokens, Komponenten-Code und Agentensteuerung zu einem überprüfbaren System verbindet."
      />

      <div className="space-y-6">
        {/* 2. REPRODUZIERBARER TESTFALL AUS FIXTURES.TS */}
        <section
          id="testfall-03"
          tabIndex={-1}
          aria-labelledby="testfall-03-title"
          className="scroll-mt-20 rounded-2xl border border-border/80 bg-card p-6 shadow-xs space-y-6 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/60">
            <div>
              <div className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider mb-1">
                Testfall 03 // CLI-Validierung im Repository
              </div>
              <h2 id="testfall-03-title" className="text-base font-bold text-foreground tracking-tight">
                Eine unerlaubte Button-Farbe wird abgelehnt
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Der CLI-Test weist die unerlaubte Klasse zurück und liefert eine konkrete Korrekturanweisung.
              </p>
              <div className="text-[11px] font-mono text-muted-foreground/80 mt-1">
                11 gezielte Prüfungen bestätigt · 1 bekannte Regelgrenze dokumentiert
              </div>
            </div>

            <button
              type="button"
              onClick={() => setActiveTab("agentic-lab")}
              aria-label="Ähnliche Fehler im Lab simulieren"
              className="inline-flex items-center gap-1.5 rounded-lg border border-border/80 bg-muted/40 hover:bg-muted px-3 py-1.5 text-xs font-medium text-foreground transition-colors cursor-pointer self-start sm:self-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 shrink-0"
              title="Ähnliche Fehler im Lab simulieren"
            >
              <span>Ähnliche Fehler im Lab simulieren</span>
              <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
          </div>

        {/* 3-Spalten-Ablauf: Eingabe -> Ablehnung -> Korrekturhinweis (Trennlinien statt verschachtelter Boxen) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Schritt 1: Eingabe */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-muted-foreground">1. Eingabe</span>
              <span className="text-xs font-semibold text-foreground">Agent-Payload</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Agent versucht, einen Button mit einer willkürlichen CSS-Klasse manuell rot einzufärben:
            </p>
            <div className="p-3 rounded-lg bg-muted/30 border border-border/60 font-mono text-xs text-foreground overflow-x-auto">
              <code>&#123; component: "Button", className: "bg-[#ff0000] text-white" &#125;</code>
            </div>
          </div>

          {/* Schritt 2: Ablehnung */}
          <div className="space-y-2.5 md:border-l md:border-border/60 md:pl-6">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-amber-600 dark:text-amber-400">2. Ablehnung</span>
              <span className="text-xs font-semibold text-foreground">Katalog-Regel (.strict)</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              <code>ButtonApi.schema.strict()</code> in <code>catalog.api.ts</code> lässt nur deklarierte Props zu:
            </p>
            <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 font-mono text-xs text-amber-700 dark:text-amber-300 overflow-x-auto">
              <code>Unrecognized key(s) in object: 'className'</code>
            </div>
          </div>

          {/* Schritt 3: Korrekturhinweis */}
          <div className="space-y-2.5 md:border-l md:border-border/60 md:pl-6">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-rose-600 dark:text-rose-400">3. Korrektur</span>
              <span className="text-xs font-semibold text-foreground">Handlungsanweisung</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              <code>explain.ts</code> übersetzt die Zod-Meldung in eine konkrete Korrekturanweisung für das LLM:
            </p>
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs space-y-1.5 text-foreground">
              <div>
                <span className="text-muted-foreground font-mono text-[11px] block font-semibold">URSACHE:</span>
                <span className="leading-relaxed">'className' existiert nicht im Katalog. Stile dürfen nicht frei gesetzt werden.</span>
              </div>
              <div className="pt-1.5 border-t border-rose-500/20">
                <span className="text-emerald-600 dark:text-emerald-400 font-mono text-[11px] block font-semibold">BEHEBUNG:</span>
                <span>Erlaubte Variante wählen: <code className="font-mono">variant: "primary"</code></span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. DAS ARCHITEKTUR-SCHNITT-BILD MIT ZWEI VERBUNDENEN PFADEN */}
      <section className="rounded-2xl border border-border/80 bg-card overflow-hidden shadow-xs flex flex-col">
        {/* Header Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/60 px-6 py-4 bg-card">
          <div className="space-y-0.5">
            <h3 className="text-sm font-semibold tracking-tight text-foreground">
              Vom Design Token zur geprüften Agenten-Ausgabe
            </h3>
            <p className="text-xs text-foreground/90 font-medium">
              Der Build-Pfad definiert erlaubte UI. Der Prüf-Pfad blockiert Ausgaben, die davon abweichen.
            </p>
            <p className="text-[11px] text-muted-foreground">
              Station auswählen: Regel, Ergebnis und Code ansehen.
            </p>
          </div>
        </div>

        {/* Die beiden visuellen Pfade */}
        <div className="p-6 space-y-6">
          {/* PFAD 1: BUILD-PIPELINE */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
              <h4 className="text-xs font-bold text-foreground">
                Pfad 1: Build — Tokens werden zu Komponenten
              </h4>
              <span className="text-xs text-muted-foreground">
                Kompilierzeit: Tokens zu statischen CSS-Variablen &amp; Figma-JSON
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {ARCHITECTURE_STATIONS.filter((s) => s.pathway === "build").map((station) => {
                const isSelected = selectedStationId === station.id
                return (
                  <button
                    key={station.id}
                    onClick={() =>
                      setSelectedStationId((prev) => (prev === station.id ? null : station.id))
                    }
                    type="button"
                    aria-pressed={isSelected}
                    aria-label={`Station ${station.stepNumber}: ${station.title}`}
                    className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
                      isSelected
                        ? "border-primary bg-primary/10 shadow-xs ring-1 ring-primary/40"
                        : "border-border/60 bg-muted/15 hover:bg-muted/30 hover:border-border/80"
                    }`}
                  >
                    <div>
                      <span className="font-mono text-xs font-bold text-muted-foreground">
                        {station.stepNumber}
                      </span>
                      <h5 className="font-semibold text-xs text-foreground mt-1">
                        {station.title}
                      </h5>
                    </div>

                    <p className="text-xs text-muted-foreground mt-3 pt-2 border-t border-border/40 leading-snug">
                      {station.function}
                    </p>
                  </button>
                )
              })}
            </div>
          </div>

          {/* DESKTOP CONNECTOR: B4 HINUNTER ZUR BRÜCKE */}
          <div className="hidden lg:grid grid-cols-4 gap-3 my-1 px-2 pointer-events-none">
            <div />
            <div />
            <div />
            <div className="flex justify-center items-center">
              <ArrowDown className="h-3.5 w-3.5 text-primary/70" />
            </div>
          </div>

          {/* VERBINDENDE SYSTEM-BEZIEHUNG: B4 (REACT UI) ➔ A2 (KATALOG) */}
          <div className="rounded-xl border border-primary/25 bg-muted/30 p-4 text-xs shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-primary">
                    B4 React Core UI ➔ A2 Katalog
                  </span>
                </div>
                <p className="font-semibold text-foreground text-xs">
                  Der Katalog gibt eine eingeschränkte Auswahl der Komponenten für Agenten frei.
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Agenten erzeugen kein freies HTML/JSX, sondern steuern ausschließlich die im Zod-Katalog freigegebene Schnittstelle der React-Komponenten an.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedStationId("catalog-contract")}
                aria-label="Katalog-Regel (A2) einsehen"
                className="font-mono text-xs text-primary hover:underline transition-colors cursor-pointer flex items-center gap-1 shrink-0 self-start sm:self-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded-sm"
              >
                <span>Katalog-Regel (A2) einsehen</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* DESKTOP CONNECTOR: BRÜCKE HINUNTER ZU A2 */}
          <div className="hidden lg:grid grid-cols-4 gap-3 my-1 px-2 pointer-events-none">
            <div />
            <div className="flex justify-center items-center">
              <ArrowDown className="h-3.5 w-3.5 text-emerald-500/80" />
            </div>
            <div />
            <div />
          </div>

          {/* PFAD 2: AGENTIC UI GOVERNANCE */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
              <h4 className="text-xs font-bold text-foreground">
                Pfad 2: Prüfung — Agenten-Ausgaben gegen Regeln
              </h4>
              <span className="text-xs text-muted-foreground">
                Validierung: Agenten-JSON gegen strikten Zod-Katalog (node src/a2ui/check.ts)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {ARCHITECTURE_STATIONS.filter((s) => s.pathway === "agent").map((station) => {
                const isSelected = selectedStationId === station.id
                return (
                  <button
                    key={station.id}
                    onClick={() =>
                      setSelectedStationId((prev) => (prev === station.id ? null : station.id))
                    }
                    type="button"
                    aria-pressed={isSelected}
                    aria-label={`Station ${station.stepNumber}: ${station.title}`}
                    className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40 ${
                      isSelected
                        ? "border-emerald-500 bg-emerald-500/10 shadow-xs ring-1 ring-emerald-500/40"
                        : "border-border/60 bg-muted/15 hover:bg-muted/30 hover:border-border/80"
                    }`}
                  >
                    <div>
                      <span className="font-mono text-xs font-bold text-muted-foreground">
                        {station.stepNumber}
                      </span>
                      <h5 className="font-semibold text-xs text-foreground mt-1">
                        {station.title}
                      </h5>
                    </div>

                    <p className="text-xs text-muted-foreground mt-3 pt-2 border-t border-border/40 leading-snug">
                      {station.function}
                    </p>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* 4. DETAILBEREICH DER AUSGEWÄHLTEN STATION (NUR NACH AUSWAHL) */}
        {activeStation ? (
          <div className="border-t border-border/60 bg-muted/10 p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-border/60">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-xs font-bold text-foreground">
                  Station {activeStation.stepNumber}: {activeStation.title}
                </span>
                <span className="text-muted-foreground text-xs">•</span>
                <span className="font-mono text-xs text-muted-foreground">
                  Datei: {activeStation.sourceFile}
                </span>
              </div>

              <div className="flex items-center gap-3 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setShowCode((prev) => !prev)}
                  aria-expanded={showCode}
                  aria-label={showCode ? "Code-Beleg schließen" : "Code-Beleg einblenden"}
                  className="inline-flex items-center gap-1 font-mono text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded-sm"
                >
                  <Code2 className="h-3.5 w-3.5" />
                  <span>{showCode ? "Code-Beleg schließen" : "Code-Beleg einblenden"}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedStationId(null)}
                  aria-label="Detailansicht schließen"
                  className="font-mono text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded-sm"
                  title="Detailansicht schließen"
                >
                  ✕ Schließen
                </button>
              </div>
            </div>

            {/* SYSTEM-BEZIEHUNG: INTERAKTIVE KOPPLUNG BEI B4 ODER A2 */}
            {(activeStation.id === "react-components" || activeStation.id === "catalog-contract") && (
              <div className="rounded-lg border border-primary/25 bg-primary/[0.04] p-3 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-start sm:items-center gap-2">
                  <span className="font-mono text-[10px] font-bold text-primary uppercase bg-primary/10 px-2 py-0.5 rounded border border-primary/20 shrink-0">
                    System-Beziehung
                  </span>
                  <span className="text-foreground font-medium font-sans">
                    Der Katalog gibt eine eingeschränkte Auswahl der Komponenten für Agenten frei.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setSelectedStationId(
                      activeStation.id === "react-components" ? "catalog-contract" : "react-components"
                    )
                  }
                  aria-label={`Zu Station ${activeStation.id === "react-components" ? "A2 (Katalog)" : "B4 (React UI)"} wechseln`}
                  className="font-mono text-xs text-primary hover:underline cursor-pointer self-start sm:self-auto shrink-0 flex items-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded-sm"
                >
                  <span>Zu Station {activeStation.id === "react-components" ? "A2 (Katalog)" : "B4 (React UI)"} wechseln</span>
                  <ArrowRight className="h-3 w-3" />
                </button>
              </div>
            )}

            {/* 3-Spalten-Schnitt: Eingabe -> Ausgabe -> Entscheidung */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-3.5 rounded-lg border border-border/60 bg-card space-y-1">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block font-mono">
                  Eingabe (Input)
                </span>
                <p className="text-xs text-foreground font-sans leading-relaxed">
                  {activeStation.inputDescription}
                </p>
              </div>

              <div className="p-3.5 rounded-lg border border-border/60 bg-card space-y-1">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block font-mono">
                  Ausgabe (Output)
                </span>
                <p className="text-xs text-foreground font-sans leading-relaxed">
                  {activeStation.outputDescription}
                </p>
              </div>

              <div className="p-3.5 rounded-lg border border-border/60 bg-card space-y-1">
                <span className="text-xs font-bold text-primary uppercase tracking-wider block font-mono">
                  {activeStation.adrTag ?? "Architektur-Entscheidung"}
                </span>
                <p className="text-xs text-foreground font-sans leading-relaxed">
                  {activeStation.adrDecision}
                </p>
              </div>
            </div>

            {/* Echter Code-Beleg aus dem Repository (Standardmäßig geschlossen) */}
            {showCode && (
              <div className="rounded-xl border border-border/60 bg-card overflow-hidden font-mono text-xs">
                <div className="flex items-center justify-between border-b border-border/60 px-4 py-2 bg-muted/20 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Terminal className="h-3.5 w-3.5 text-primary" />
                    <span className="text-foreground font-semibold">
                      {activeStation.codeSnippet.title}
                    </span>
                    {activeStation.codeSnippet.isSimplified && (
                      <span className="text-xs text-muted-foreground italic">
                        (Vereinfachtes Schema)
                      </span>
                    )}
                  </div>
                  <span className="uppercase text-[10px]">
                    {activeStation.codeSnippet.language}
                  </span>
                </div>
                <pre className="p-4 text-xs leading-relaxed text-foreground overflow-x-auto whitespace-pre-wrap break-words max-h-60">
                  <code>{activeStation.codeSnippet.code}</code>
                </pre>
              </div>
            )}
          </div>
        ) : (
          <div className="border-t border-border/60 bg-muted/5 px-6 py-3.5 flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <Terminal className="h-3.5 w-3.5 text-primary shrink-0" />
              <span>Station auswählen: Regel, Ergebnis und Code ansehen.</span>
            </div>
            <span className="text-xs text-muted-foreground/60 hidden sm:inline">Klick öffnet Details</span>
          </div>
        )}
      </section>

      {/* 4. ÜBERGREIFENDE ARCHITEKTURENTSCHEIDUNG (ADR-03) */}
      <section className="pt-2 border-t border-border/60 space-y-2 text-xs">
        <div className="flex items-center justify-between text-muted-foreground pb-1">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground font-mono">
            Übergreifende Architekturentscheidung
          </h3>
          <span className="font-mono text-xs text-muted-foreground">
            ADR-03
          </span>
        </div>

        <div className="space-y-1 text-muted-foreground">
          <span className="font-semibold text-foreground block">ADR-03 // Enterprise-Domäne</span>
          <p className="text-xs text-muted-foreground font-sans leading-relaxed">
            Die Demo verwendet Rollen, Zugriffsrechte und SSO-Provisioning, damit Guardrails an realistischen, sicherheitsrelevanten UI-Mustern geprüft werden.
          </p>
        </div>
      </section>
      </div>
    </div>
  )
}
