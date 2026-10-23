import { useState, useMemo } from "react"
import {
  Search,
  Copy,
  Check,
  ArrowRight,
} from "lucide-react"

export type TokenFilterTab = "all" | "semantic" | "primitive"

export interface TokenItem {
  id: string
  name: string
  path: string
  cssVar: string
  value: string
  resolvedValue: string
  type: "color" | "dimension" | "fontFamily" | "number"
  tier: "semantic" | "primitive"
  category: "color" | "space-radius" | "typography"
  alias?: string
  componentTarget?: string
  useFor?: string
  avoidFor?: string
  description?: string
}

const TOKEN_CATALOG: TokenItem[] = [
  // Semantic Tokens (Tier 2 - Purpose-Bound & Role Aliases)
  {
    id: "color.background.primary.default",
    name: "action.primary.default",
    path: "color.background.primary.default",
    cssVar: "--color-background-primary-default",
    value: "{colors.violet.700}",
    resolvedValue: "#6d28d9",
    type: "color",
    tier: "semantic",
    category: "color",
    alias: "colors.violet.700",
    componentTarget: "Button (variant=primary)",
    useFor: "Haupt-Aktion in einem Flow, primärer CTA",
    avoidFor: "dekorative Flächen, sekundäre/tertiäre Aktionen",
    description: "Deterministischer Standard-Hintergrund für Hauptaktionen.",
  },
  {
    id: "color.background.primary.hover",
    name: "action.primary.hover",
    path: "color.background.primary.hover",
    cssVar: "--color-background-primary-hover",
    value: "{colors.violet.800}",
    resolvedValue: "#5b21b6",
    type: "color",
    tier: "semantic",
    category: "color",
    alias: "colors.violet.800",
    componentTarget: "Button:hover (variant=primary)",
    useFor: "Hover-State für primäre Buttons",
    avoidFor: "Standardzustand oder inaktive Buttons",
    description: "Abgedunkelter Brand-Violet-Farbton für aktives Nutzer-Feedback.",
  },
  {
    id: "color.text.primary.default",
    name: "text.primary.default",
    path: "color.text.primary.default",
    cssVar: "--color-text-primary-default",
    value: "{colors.white}",
    resolvedValue: "#ffffff",
    type: "color",
    tier: "semantic",
    category: "color",
    alias: "colors.white",
    componentTarget: "Button label, Badge text",
    useFor: "Lesbarer Text auf primärem Aktionshintergrund",
    avoidFor: "Fließtext auf hellem Hintergrund (unzureichender Kontrast)",
    description: "Reines Weiß für maximalen Kontrast auf Brand-Flächen (7.4:1).",
  },
  {
    id: "color.text.destructive.default",
    name: "text.destructive.default",
    path: "color.text.destructive.default",
    cssVar: "--color-text-destructive-default",
    value: "{colors.red.700}",
    resolvedValue: "#b91c1c",
    type: "color",
    tier: "semantic",
    category: "color",
    alias: "colors.red.700",
    componentTarget: "Button (variant=destructive), FormField error",
    useFor: "Text auf getöntem Destructive-Hintergrund (bg-destructive/10)",
    avoidFor: "Text auf vollflächig rotem Grund (dort weiß verwenden)",
    description: "Spezifisch kalibriertes Rot für AA-Konformität auf subtilen Tints.",
  },
  {
    id: "color.border.primary.default",
    name: "border.primary.default",
    path: "color.border.primary.default",
    cssVar: "--color-border-primary-default",
    value: "{colors.violet.600}",
    resolvedValue: "#7c3aed",
    type: "color",
    tier: "semantic",
    category: "color",
    alias: "colors.violet.600",
    componentTarget: "Button:focus-visible, Active Input border",
    useFor: "Fokus- und Rahmen-Akzente auf primären Elementen",
    avoidFor: "Neutrale Container-Bordüren (dort border-border)",
    description: "Signalstarker Fokus-Ring gemäß WCAG 2.1 Focus-Appearance.",
  },

  // Primitive Palette Colors (Tier 1)
  {
    id: "colors.violet.500",
    name: "violet.500",
    path: "colors.violet.500",
    cssVar: "--colors-violet-500",
    value: "#8b5cf6",
    resolvedValue: "#8b5cf6",
    type: "color",
    tier: "primitive",
    category: "color",
    componentTarget: "Raw Palette Primitive",
    description: "Brand Primitive Violet Hell (Luminanz 31%).",
  },
  {
    id: "colors.violet.600",
    name: "violet.600",
    path: "colors.violet.600",
    cssVar: "--colors-violet-600",
    value: "#7c3aed",
    resolvedValue: "#7c3aed",
    type: "color",
    tier: "primitive",
    category: "color",
    componentTarget: "Raw Palette Primitive",
    description: "Brand Primitive Violet Basis (Referenziert von border.primary).",
  },
  {
    id: "colors.violet.700",
    name: "violet.700",
    path: "colors.violet.700",
    cssVar: "--colors-violet-700",
    value: "#6d28d9",
    resolvedValue: "#6d28d9",
    type: "color",
    tier: "primitive",
    category: "color",
    componentTarget: "Raw Palette Primitive",
    description: "Brand Primitive Violet Dunkel (Referenziert von background.primary).",
  },
  {
    id: "colors.violet.800",
    name: "violet.800",
    path: "colors.violet.800",
    cssVar: "--colors-violet-800",
    value: "#5b21b6",
    resolvedValue: "#5b21b6",
    type: "color",
    tier: "primitive",
    category: "color",
    componentTarget: "Raw Palette Primitive",
    description: "Brand Primitive Violet Deep (Referenziert von background.hover).",
  },
  {
    id: "colors.blue.600",
    name: "blue.600",
    path: "colors.blue.600",
    cssVar: "--colors-blue-600",
    value: "#2563eb",
    resolvedValue: "#2563eb",
    type: "color",
    tier: "primitive",
    category: "color",
    componentTarget: "Raw Palette Primitive",
    description: "Legacy Blue Accent aus Figma-Baseline.",
  },
  {
    id: "colors.red.700",
    name: "red.700",
    path: "colors.red.700",
    cssVar: "--colors-red-700",
    value: "#b91c1c",
    resolvedValue: "#b91c1c",
    type: "color",
    tier: "primitive",
    category: "color",
    componentTarget: "Raw Palette Primitive",
    description: "WCAG AAA Alert Red Primitive.",
  },
  {
    id: "colors.white",
    name: "white",
    path: "colors.white",
    cssVar: "--colors-white",
    value: "#ffffff",
    resolvedValue: "#ffffff",
    type: "color",
    tier: "primitive",
    category: "color",
    componentTarget: "Raw Palette Primitive",
    description: "Absolute Pure White Primitive (#ffffff).",
  },

  // Space & Radii Primitives (Tier 1)
  {
    id: "space.component.sm",
    name: "space.component.sm",
    path: "space.component.sm",
    cssVar: "--space-component-sm",
    value: "8px",
    resolvedValue: "8px",
    type: "dimension",
    tier: "primitive",
    category: "space-radius",
    componentTarget: "Button.py, FormField.gap",
    useFor: "Innere Abstände und vertikale Element-Gaps",
    avoidFor: "Große Container-Paddings (dort space.component.md)",
    description: "W3C 8px-Raster Basiseinheit (1x Grid).",
  },
  {
    id: "space.component.md",
    name: "space.component.md",
    path: "space.component.md",
    cssVar: "--space-component-md",
    value: "16px",
    resolvedValue: "16px",
    type: "dimension",
    tier: "primitive",
    category: "space-radius",
    componentTarget: "Button.px, Card.padding",
    useFor: "Horizontale Button-Paddings und Standard-Abstände",
    avoidFor: "Feine Inline-Icons",
    description: "W3C 8px-Raster Doppeleinheit (2x Grid).",
  },
  {
    id: "radii.md",
    name: "radii.md",
    path: "radii.md",
    cssVar: "--radii-md",
    value: "6px",
    resolvedValue: "6px",
    type: "dimension",
    tier: "primitive",
    category: "space-radius",
    componentTarget: "Button, Input, Badge",
    useFor: "Standardmäßige Eckenabrundung für interaktive Kontrollen",
    avoidFor: "Vollständig runde Avatare (dort rounded-full)",
    description: "Subtile, moderne Eckenverrundung für dichte B2B-UIs.",
  },

  // Typography Primitives (Tier 1)
  {
    id: "font.size.sm",
    name: "font.size.sm",
    path: "font.size.sm",
    cssVar: "--font-size-sm",
    value: "12px",
    resolvedValue: "12px",
    type: "dimension",
    tier: "primitive",
    category: "typography",
    componentTarget: "FormField.hint, Badge",
    useFor: "Hilfstext und Fehlermeldungen unterhalb von Feldern",
    avoidFor: "Fließtext, Labels, Button-Text (dort font.size.md)",
    description: "Kompakter Beschriftungstext mit 16px Zeilenhöhe.",
  },
  {
    id: "font.size.md",
    name: "font.size.md",
    path: "font.size.md",
    cssVar: "--font-size-md",
    value: "14px",
    resolvedValue: "14px",
    type: "dimension",
    tier: "primitive",
    category: "typography",
    componentTarget: "Button.text, Input.text, Body",
    useFor: "Standard UI-Größe für Controls und Formulare",
    avoidFor: "H1/H2 Überschriften",
    description: "Standard-Arbeitsgröße für B2B-Oberflächen.",
  },
  {
    id: "font.size.xl",
    name: "font.size.xl",
    path: "font.size.xl",
    cssVar: "--font-size-xl",
    value: "24px",
    resolvedValue: "24px",
    type: "dimension",
    tier: "primitive",
    category: "typography",
    componentTarget: "Card Title, Header Headline",
    useFor: "Modaltitel und Sektionsüberschriften",
    avoidFor: "Fließtext",
    description: "Display-Größe für Enterprise-Seitentitel.",
  },
  {
    id: "font.family.base",
    name: "font.family.base",
    path: "font.family.base",
    cssVar: "--font-family-base",
    value: "'Geist Variable'",
    resolvedValue: "'Geist Variable', -apple-system, sans-serif",
    type: "fontFamily",
    tier: "primitive",
    category: "typography",
    componentTarget: "Universal Body & Controls",
    description: "Geist Sans Schriftenfamilie für maximale Lesbarkeit.",
  },
]

// Accurate WCAG 2.1 Contrast Formula
function hexToRgb(hex: string): [number, number, number] | null {
  const clean = hex.replace("#", "").trim()
  if (clean.length === 3) {
    return [
      parseInt(clean[0] + clean[0], 16),
      parseInt(clean[1] + clean[1], 16),
      parseInt(clean[2] + clean[2], 16),
    ]
  }
  if (clean.length === 6) {
    return [
      parseInt(clean.substring(0, 2), 16),
      parseInt(clean.substring(2, 4), 16),
      parseInt(clean.substring(4, 6), 16),
    ]
  }
  return null
}

function getRelativeLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r / 255, g / 255, b / 255].map((c) => {
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
}

function calculateContrastRatio(hex1: string, hex2: string): number {
  const rgb1 = hexToRgb(hex1)
  const rgb2 = hexToRgb(hex2)
  if (!rgb1 || !rgb2) return 1
  const lum1 = getRelativeLuminance(rgb1[0], rgb1[1], rgb1[2])
  const lum2 = getRelativeLuminance(rgb2[0], rgb2[1], rgb2[2])
  const lighter = Math.max(lum1, lum2)
  const darker = Math.min(lum1, lum2)
  return (lighter + 0.05) / (darker + 0.05)
}

export function TokenView() {
  const [selectedTokenId, setSelectedTokenId] = useState<string>("color.background.primary.default")
  const [activeTab, setActiveTab] = useState<TokenFilterTab>("all")
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [exportFormat, setExportFormat] = useState<"json" | "css" | "ts" | "prompt">("json")
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null)

  const selectedToken =
    TOKEN_CATALOG.find((t) => t.id === selectedTokenId) || TOKEN_CATALOG[0]

  // Dynamic counts for 2-Tier W3C Architecture
  const tabCounts = useMemo(() => {
    return {
      all: TOKEN_CATALOG.length,
      semantic: TOKEN_CATALOG.filter((t) => t.tier === "semantic").length,
      primitive: TOKEN_CATALOG.filter((t) => t.tier === "primitive").length,
    }
  }, [])

  // Filter Tokens (Clean 2-Tier DTCG Model)
  const filteredTokens = useMemo(() => {
    return TOKEN_CATALOG.filter((token) => {
      let matchesTab = true
      if (activeTab === "semantic") {
        matchesTab = token.tier === "semantic"
      } else if (activeTab === "primitive") {
        matchesTab = token.tier === "primitive"
      }

      const query = searchQuery.toLowerCase().trim()
      const matchesQuery =
        !query ||
        token.name.toLowerCase().includes(query) ||
        token.path.toLowerCase().includes(query) ||
        token.cssVar.toLowerCase().includes(query) ||
        token.resolvedValue.toLowerCase().includes(query)
      return matchesTab && matchesQuery
    })
  }, [activeTab, searchQuery])

  // Contrast Computations for Color Tokens
  const contrastLight = useMemo(() => {
    if (selectedToken.type !== "color") return null
    return calculateContrastRatio(selectedToken.resolvedValue, "#ffffff")
  }, [selectedToken])

  const contrastDark = useMemo(() => {
    if (selectedToken.type !== "color") return null
    return calculateContrastRatio(selectedToken.resolvedValue, "#09090b")
  }, [selectedToken])

  const contrastOnViolet = useMemo(() => {
    if (selectedToken.type !== "color") return null
    return calculateContrastRatio(selectedToken.resolvedValue, "#6d28d9")
  }, [selectedToken])

  // Code Export Generators
  const exportCode = useMemo(() => {
    if (exportFormat === "json") {
      const obj: Record<string, unknown> = {
        $schema: "https://design-tokens.github.io/community-group/format/",
        [selectedToken.path]: {
          $value: selectedToken.value,
          $type: selectedToken.type,
          $description: selectedToken.description,
          ...(selectedToken.useFor ? { useFor: selectedToken.useFor } : {}),
          ...(selectedToken.avoidFor ? { avoidFor: selectedToken.avoidFor } : {}),
        },
      }
      return JSON.stringify(obj, null, 2)
    }

    if (exportFormat === "css") {
      return `/* Style Dictionary 4.0 Compiled Output */
:root {
  ${selectedToken.cssVar}: ${selectedToken.resolvedValue};
  /* W3C DTCG Alias: ${selectedToken.value} */
}`
    }

    if (exportFormat === "ts") {
      return `/**
 * Strict Design Token Definition
 */
export const ${selectedToken.name.replace(/[^a-zA-Z0-9]/g, "_")} = {
  name: "${selectedToken.name}",
  cssVar: "${selectedToken.cssVar}",
  value: "${selectedToken.resolvedValue}",
  w3cPath: "${selectedToken.path}",
  type: "${selectedToken.type}",
} as const;`
    }

    // LLM Prompt Manifest
    return `### LLM AGENT CODE GUARDRAIL
Rule for '${selectedToken.path}':
- CSS Token: var(${selectedToken.cssVar})
- Exact Value: ${selectedToken.resolvedValue}
${selectedToken.useFor ? `- Mandatory Usage: ${selectedToken.useFor}` : ""}
${selectedToken.avoidFor ? `- Strictly Forbidden: ${selectedToken.avoidFor}` : ""}
- Guardrail: Never inject raw hex colors or arbitrary dimensions for this component role.`
  }, [selectedToken, exportFormat])

  function handleCopyExport() {
    navigator.clipboard.writeText(exportCode)
    setCopiedFormat(exportFormat)
    setTimeout(() => setCopiedFormat(null), 2000)
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      {/* Clean Header: Human-friendly, benefit-driven UX writing */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          W3C Design Token Architecture
        </h2>
        <p className="text-sm text-muted-foreground mt-1.5 max-w-2xl leading-relaxed">
          Eine gemeinsame Sprache für Design, Code und KI. Farben, Abstände und Barrierefreiheit zentral definiert — ohne manuelle Fehler.
        </p>
      </div>

      {/* 2-Column Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (7/12): Single-Row Segmented Filter & Token Directory */}
        <div className="lg:col-span-7 space-y-4">
          {/* Controls: Generous Apple Desktop Segmented Tabs + Search */}
          <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
            {/* 3 Clean W3C DTCG Segmented Tabs: 38px Height, 14px Font */}
            <div className="inline-flex p-1 bg-muted/70 dark:bg-muted/40 rounded-xl gap-1.5 border border-border/60 shadow-2xs">
              {[
                { id: "all", label: `Alle (${tabCounts.all})` },
                { id: "semantic", label: `Semantic (${tabCounts.semantic})` },
                { id: "primitive", label: `Primitives (${tabCounts.primitive})` },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TokenFilterTab)}
                  className={`rounded-lg px-4 py-2 text-sm tracking-tight transition-all whitespace-nowrap cursor-pointer ${
                    activeTab === tab.id
                      ? "bg-card text-foreground font-semibold shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Generous Search Input: 260px Width, 40px Height */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground/50 pointer-events-none" />
              <input
                type="text"
                placeholder="Token oder Wert suchen..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 pl-9 pr-3.5 text-sm bg-card border border-border/80 rounded-xl text-foreground placeholder:text-muted-foreground/40 dark:placeholder:text-muted-foreground/30 focus:outline-none focus:ring-2 focus:ring-primary/40 font-mono shadow-xs transition-shadow"
              />
            </div>
          </div>

          {/* Tokens List Card: Scrollbar eliminated */}
          <div className="rounded-2xl border border-border/80 bg-card overflow-hidden shadow-xs">
            <div className="overflow-x-auto sm:overflow-x-visible">
              <table className="w-full text-left font-mono text-xs">
                <thead className="border-b border-border/60 bg-muted/30 text-muted-foreground text-[10px] uppercase tracking-wider">
                  <tr>
                    <th className="py-2.5 px-3 sm:px-4">Token & Rolle</th>
                    <th className="py-2.5 px-2">Ebene</th>
                    <th className="py-2.5 px-2">W3C Wert</th>
                    <th className="py-2.5 px-3 sm:px-4 text-right">Preview</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {filteredTokens.map((token) => {
                    const isSelected = token.id === selectedTokenId
                    return (
                      <tr
                        key={token.id}
                        onClick={() => setSelectedTokenId(token.id)}
                        className={`cursor-pointer transition-colors ${
                          isSelected
                            ? "bg-primary/5 dark:bg-primary/10 border-l-2 border-primary"
                            : "hover:bg-muted/30"
                        }`}
                      >
                        <td className="py-2.5 px-3 sm:px-4">
                          <div className="font-semibold text-[13px] text-foreground tracking-tight">
                            {token.cssVar}
                          </div>
                          <div className="text-[11px] text-muted-foreground mt-0.5">
                            {token.path}
                          </div>
                        </td>
                        <td className="py-2.5 px-2">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${
                              token.tier === "semantic"
                                ? "bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20"
                                : "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20"
                            }`}
                          >
                            {token.tier}
                          </span>
                        </td>
                        <td className="py-2.5 px-2 text-xs text-muted-foreground">
                          {token.alias ? (
                            <span className="text-primary font-medium">
                              {token.value}
                            </span>
                          ) : (
                            <span>{token.value}</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 sm:px-4 text-right">
                          {token.type === "color" ? (
                            <div className="inline-flex items-center gap-2 justify-end">
                              <span className="text-xs text-muted-foreground font-mono">
                                {token.resolvedValue}
                              </span>
                              <div
                                className="h-5 w-5 rounded-md border border-border/80 shadow-2xs shrink-0"
                                style={{ backgroundColor: token.resolvedValue }}
                              />
                            </div>
                          ) : token.category === "space-radius" ? (
                            <div className="inline-flex items-center gap-2 justify-end">
                              <span className="text-xs text-muted-foreground font-mono">
                                {token.resolvedValue}
                              </span>
                              <div
                                className="bg-primary/20 border border-primary/40 rounded-xs shrink-0"
                                style={{
                                  width: token.resolvedValue,
                                  height: token.resolvedValue,
                                  minWidth: "6px",
                                  minHeight: "6px",
                                }}
                              />
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground truncate max-w-[80px] inline-block font-mono">
                              {token.resolvedValue}
                            </span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {filteredTokens.length === 0 && (
              <div className="p-8 text-center text-xs text-muted-foreground">
                Keine Tokens gefunden für die aktuelle Filterung.
              </div>
            )}
          </div>
        </div>

        {/* Right Column (5/12): Inspector, Traceability, Contrast & Code Export */}
        <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-16">
          {/* Card 1: W3C Alias Traceability Flow */}
          <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-xs space-y-4">
            <div className="border-b border-border/60 pb-3">
              <h3 className="text-sm font-semibold tracking-tight text-foreground">
                Alias Traceability Flow
              </h3>
            </div>

            {/* Traceability Graph Nodes */}
            <div className="space-y-2.5">
              {/* Step 1: Primitive */}
              <div className="p-3 rounded-xl bg-muted/30 border border-border/60 space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-muted-foreground font-medium">1. Primitive Token</span>
                  <span className="font-mono text-primary font-medium">
                    {selectedToken.alias || selectedToken.id}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-foreground font-semibold">
                    {selectedToken.resolvedValue}
                  </span>
                  {selectedToken.type === "color" && (
                    <div
                      className="h-3.5 w-3.5 rounded border border-border/80 shadow-2xs"
                      style={{ backgroundColor: selectedToken.resolvedValue }}
                    />
                  )}
                </div>
              </div>

              {/* Arrow */}
              <div className="flex justify-center text-muted-foreground/60 py-0.5">
                <ArrowRight className="h-3.5 w-3.5 rotate-90" />
              </div>

              {/* Step 2: Semantic Token */}
              <div className="p-3 rounded-xl bg-primary/5 dark:bg-primary/10 border border-primary/20 space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-primary font-medium">2. Semantic Token</span>
                  <span className="font-mono text-[10px] text-muted-foreground">
                    {selectedToken.tier}
                  </span>
                </div>
                <div className="text-xs font-mono font-semibold text-foreground">
                  {selectedToken.cssVar}
                </div>
                {selectedToken.description && (
                  <p className="text-[11px] text-muted-foreground font-sans pt-1">
                    {selectedToken.description}
                  </p>
                )}
              </div>

              {/* Arrow */}
              <div className="flex justify-center text-muted-foreground/60 py-0.5">
                <ArrowRight className="h-3.5 w-3.5 rotate-90" />
              </div>

              {/* Step 3: Component Binding */}
              <div className="p-3 rounded-xl bg-muted/30 border border-border/60 space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-muted-foreground font-medium">3. Component Binding</span>
                  <span className="font-mono text-emerald-600 dark:text-emerald-400 font-medium text-[10px]">
                    Runtime Guardrail
                  </span>
                </div>
                <div className="text-xs font-mono font-semibold text-foreground">
                  {selectedToken.componentTarget || "Global Design Scale"}
                </div>
              </div>
            </div>

            {/* Prominent Agent Contract Guardrails (useFor / avoidFor from tokens.json) */}
            {(selectedToken.useFor || selectedToken.avoidFor) && (
              <div className="pt-3 border-t border-border/60 space-y-2.5">
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-foreground">
                    Agent Contract Guardrails
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">
                    Klare Regeln für KI-Assistenten, damit Buttons und Farben immer im richtigen Kontext landen.
                  </p>
                </div>

                <div className="space-y-2">
                  {selectedToken.useFor && (
                    <div className="p-3 rounded-xl bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/20 space-y-1">
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/15 text-emerald-700 dark:text-emerald-400">
                        DO • Erlaubter Einsatz
                      </span>
                      <p className="text-xs text-foreground font-medium pl-0.5 leading-relaxed">
                        {selectedToken.useFor}
                      </p>
                    </div>
                  )}

                  {selectedToken.avoidFor && (
                    <div className="p-3 rounded-xl bg-rose-500/5 dark:bg-rose-500/10 border border-rose-500/20 space-y-1">
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-rose-500/15 text-rose-700 dark:text-rose-400">
                        DON'T • Strikt verboten
                      </span>
                      <p className="text-xs text-foreground font-medium pl-0.5 leading-relaxed">
                        {selectedToken.avoidFor}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Card 2: Live WCAG 2.1 & APCA Contrast Matrix (for Color Tokens) */}
          {selectedToken.type === "color" && (
            <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-xs space-y-4">
              <div className="border-b border-border/60 pb-3">
                <h3 className="text-sm font-semibold tracking-tight text-foreground">
                  WCAG 2.1 Accessibility Matrix
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 font-mono">
                {/* Against Light Canvas */}
                <div className="p-3 rounded-xl bg-white text-zinc-950 border border-zinc-200 shadow-2xs space-y-1.5">
                  <div className="text-[10px] text-zinc-500 uppercase tracking-tight">
                    On Light (#fff)
                  </div>
                  <div className="text-base font-bold">
                    {contrastLight?.toFixed(2)}:1
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span
                      className={`text-[9px] px-1.5 py-0.5 rounded font-semibold ${
                        (contrastLight || 0) >= 4.5
                          ? "bg-emerald-100 text-emerald-800"
                          : (contrastLight || 0) >= 3.0
                          ? "bg-amber-100 text-amber-800"
                          : "bg-rose-100 text-rose-800"
                      }`}
                    >
                      {(contrastLight || 0) >= 4.5
                        ? "AA Pass"
                        : (contrastLight || 0) >= 3.0
                        ? "Large"
                        : "Fail"}
                    </span>
                    {(contrastLight || 0) >= 7.0 && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded font-semibold bg-emerald-100 text-emerald-800">
                        AAA
                      </span>
                    )}
                  </div>
                </div>

                {/* Against Dark Canvas */}
                <div className="p-3 rounded-xl bg-zinc-950 text-white border border-zinc-800 shadow-2xs space-y-1.5">
                  <div className="text-[10px] text-zinc-400 uppercase tracking-tight">
                    On Dark (#090)
                  </div>
                  <div className="text-base font-bold">
                    {contrastDark?.toFixed(2)}:1
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span
                      className={`text-[9px] px-1.5 py-0.5 rounded font-semibold ${
                        (contrastDark || 0) >= 4.5
                          ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                          : (contrastDark || 0) >= 3.0
                          ? "bg-amber-950 text-amber-300 border border-amber-800"
                          : "bg-rose-950 text-rose-300 border border-rose-800"
                      }`}
                    >
                      {(contrastDark || 0) >= 4.5
                        ? "AA Pass"
                        : (contrastDark || 0) >= 3.0
                        ? "Large"
                        : "Fail"}
                    </span>
                    {(contrastDark || 0) >= 7.0 && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800">
                        AAA
                      </span>
                    )}
                  </div>
                </div>

                {/* Against Brand Violet Canvas */}
                <div className="p-3 rounded-xl bg-violet-950 text-violet-100 border border-violet-800 shadow-2xs space-y-1.5">
                  <div className="text-[10px] text-violet-300 uppercase tracking-tight">
                    On Brand (#6d2)
                  </div>
                  <div className="text-base font-bold">
                    {contrastOnViolet?.toFixed(2)}:1
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span
                      className={`text-[9px] px-1.5 py-0.5 rounded font-semibold ${
                        (contrastOnViolet || 0) >= 4.5
                          ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                          : (contrastOnViolet || 0) >= 3.0
                          ? "bg-amber-950 text-amber-300 border border-amber-800"
                          : "bg-rose-950 text-rose-300 border border-rose-800"
                      }`}
                    >
                      {(contrastOnViolet || 0) >= 4.5
                        ? "AA Pass"
                        : (contrastOnViolet || 0) >= 3.0
                        ? "Large"
                        : "Fail"}
                    </span>
                    {(contrastOnViolet || 0) >= 7.0 && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800">
                        AAA
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Sample Live Contrast Render Pill */}
              <div
                className="p-3 rounded-xl border border-border/80 flex items-center justify-between transition-colors"
                style={{
                  backgroundColor:
                    selectedToken.id.includes("text")
                      ? "#6d28d9"
                      : selectedToken.resolvedValue,
                  color: selectedToken.id.includes("text")
                    ? selectedToken.resolvedValue
                    : "#ffffff",
                }}
              >
                <span className="text-xs font-medium">Live Render Preview</span>
                <span className="text-[10px] font-mono opacity-85">
                  Sample Text on Surface
                </span>
              </div>
            </div>
          )}

          {/* Card 3: Multi-Target Pipeline Artifacts (Proof of Token Toolchain) */}
          <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-xs space-y-4">
            <div className="border-b border-border/60 pb-3">
              <h3 className="text-sm font-semibold tracking-tight text-foreground">
                Export für Entwickler & KI
              </h3>
            </div>

            {/* Target Format Tabs */}
            <div className="inline-flex p-0.5 bg-muted/80 rounded-lg gap-1 border border-border/60 w-full">
              {[
                { id: "json", label: "W3C JSON" },
                { id: "css", label: "CSS Vars" },
                { id: "ts", label: "TypeScript" },
                { id: "prompt", label: "LLM Guardrail" },
              ].map((fmt) => (
                <button
                  key={fmt.id}
                  onClick={() => setExportFormat(fmt.id as "json" | "css" | "ts" | "prompt")}
                  className={`flex-1 rounded-md py-1 text-[11px] font-mono tracking-tight transition-all cursor-pointer ${
                    exportFormat === fmt.id
                      ? "bg-card text-foreground font-medium shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {fmt.label}
                </button>
              ))}
            </div>

            {/* Code Output Viewer: Fixed Height prevents layout jumps */}
            <div className="relative rounded-xl bg-zinc-950 p-4 border border-zinc-800 text-zinc-100 font-mono text-[11px] leading-relaxed overflow-auto h-52">
              <pre className="whitespace-pre">{exportCode}</pre>
            </div>

            {/* Footer with subtle copy interaction & source link */}
            <div className="pt-1 flex items-center justify-between text-[11px] text-muted-foreground font-mono">
              <button
                onClick={handleCopyExport}
                className="inline-flex items-center gap-1.5 hover:text-foreground transition-colors cursor-pointer"
                title="Snippet kopieren"
              >
                {copiedFormat ? (
                  <>
                    <Check className="h-3 w-3 text-emerald-500" />
                    <span className="text-emerald-500">In Zwischenablage</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3" />
                    <span>Copy Snippet</span>
                  </>
                )}
              </button>

              <a
                href="https://github.com/andreas-keim/agentic-design-system-playground/blob/main/src/tokens/tokens.json"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground underline transition-colors"
              >
                Source: tokens.json
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
