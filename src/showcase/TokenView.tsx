import { useState, useMemo } from "react"
import {
  Search,
  Copy,
  Check,
  ArrowRight,
  Terminal,
} from "lucide-react"

import { SegmentedTabs } from "./SegmentedTabs"
import { PageHeader } from "./PageHeader"

import rawTokens from "../tokens/tokens.json"

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

interface TokenPresentationMeta {
  displayName?: string
  description?: string
  componentTarget?: string
}

/**
 * Rein presentationale Metadaten (optional nach Token-ID / Pfad).
 * Enthält KEINE Values, Typen, resolvedValues, useFor/avoidFor oder Tier-Zuordnungen,
 * damit tokens.json die alleinige Single Source of Truth für Designdaten bleibt.
 */
const TOKEN_PRESENTATION_META: Record<string, TokenPresentationMeta> = {
  // Semantic Tokens (Tier 2 - Purpose-Bound & Role Aliases)
  "color.background.primary.default": {
    displayName: "action.primary.default",
    componentTarget: "Button (variant=primary)",
    description: "Deterministischer Standard-Hintergrund für Hauptaktionen.",
  },
  "color.background.primary.hover": {
    displayName: "action.primary.hover",
    componentTarget: "Button:hover (variant=primary)",
    description: "Abgedunkelter Brand-Violet-Farbton für aktives Nutzer-Feedback.",
  },
  "color.text.primary.default": {
    displayName: "text.primary.default",
    componentTarget: "Button label, Badge text",
    description: "Reines Weiß für maximalen Kontrast auf Brand-Flächen (7.4:1).",
  },
  "color.text.destructive.default": {
    displayName: "text.destructive.default",
    componentTarget: "Button (variant=destructive), FormField error",
    description: "Spezifisch kalibriertes Rot für AA-Konformität auf subtilen Tints.",
  },
  "color.border.primary.default": {
    displayName: "border.primary.default",
    componentTarget: "Button:focus-visible, Active Input border",
    description: "Signalstarker Fokus-Ring gemäß WCAG 2.1 Focus-Appearance.",
  },

  // Primitive Palette Colors (Tier 1)
  "colors.violet.500": {
    displayName: "violet.500",
    componentTarget: "Raw Palette Primitive",
    description: "Brand Primitive Violet Hell (Luminanz 31%).",
  },
  "colors.violet.600": {
    displayName: "violet.600",
    componentTarget: "Raw Palette Primitive",
    description: "Brand Primitive Violet Basis (Referenziert von border.primary).",
  },
  "colors.violet.700": {
    displayName: "violet.700",
    componentTarget: "Raw Palette Primitive",
    description: "Brand Primitive Violet Dunkel (Referenziert von background.primary).",
  },
  "colors.violet.800": {
    displayName: "violet.800",
    componentTarget: "Raw Palette Primitive",
    description: "Brand Primitive Violet Deep (Referenziert von background.hover).",
  },
  "colors.blue.500": {
    displayName: "blue.500",
    componentTarget: "Raw Palette Primitive",
    description: "Brand Primitive Blue Hell.",
  },
  "colors.blue.600": {
    displayName: "blue.600",
    componentTarget: "Raw Palette Primitive",
    description: "Legacy Blue Accent aus Figma-Baseline.",
  },
  "colors.blue.700": {
    displayName: "blue.700",
    componentTarget: "Raw Palette Primitive",
    description: "Brand Primitive Blue Dunkel.",
  },
  "colors.red.700": {
    displayName: "red.700",
    componentTarget: "Raw Palette Primitive",
    description: "Alarm-Rot Primitive (#b91c1c). Erreicht z. B. auf Weiß (#ffffff) 6.47:1 (WCAG AA).",
  },
  "colors.white": {
    displayName: "white",
    componentTarget: "Raw Palette Primitive",
    description: "Absolute Pure White Primitive (#ffffff).",
  },

  // Space & Radii Primitives (Tier 1)
  "space.component.sm": {
    displayName: "space.component.sm",
    componentTarget: "Button.py, FormField.gap",
    description: "W3C 8px-Raster Basiseinheit (1x Grid).",
  },
  "space.component.md": {
    displayName: "space.component.md",
    componentTarget: "Button.px, Card.padding",
    description: "W3C 8px-Raster Doppeleinheit (2x Grid).",
  },
  "radii.md": {
    displayName: "radii.md",
    componentTarget: "Button, Input, Badge",
    description: "Subtile, moderne Eckenverrundung für dichte B2B-UIs.",
  },

  // Typography Primitives (Tier 1)
  "font.size.sm": {
    displayName: "font.size.sm",
    componentTarget: "FormField.hint, Badge",
    description: "Kompakter Beschriftungstext mit 16px Zeilenhöhe.",
  },
  "font.size.md": {
    displayName: "font.size.md",
    componentTarget: "Button.text, Input.text, Body",
    description: "Standard-Arbeitsgröße für B2B-Oberflächen.",
  },
  "font.size.xl": {
    displayName: "font.size.xl",
    componentTarget: "Card Title, Header Headline",
    description: "Display-Größe für Enterprise-Seitentitel.",
  },
  "font.weight.medium": {
    displayName: "font.weight.medium",
    componentTarget: "Button, FormField Label",
    description: "Mittleres Schriftgewicht (500) für interaktive Controls.",
  },
  "font.weight.bold": {
    displayName: "font.weight.bold",
    componentTarget: "Headlines",
    description: "Fettes Schriftgewicht (700) für primäre Überschriften.",
  },
  "font.lineHeight.sm": {
    displayName: "font.lineHeight.sm",
    componentTarget: "Caption / FormField Error",
    description: "Kompakte Zeilenhöhe (16px) passend zu font.size.sm.",
  },
  "font.lineHeight.md": {
    displayName: "font.lineHeight.md",
    componentTarget: "Button, Input, Body",
    description: "Standard-Zeilenhöhe (20px) passend zu font.size.md.",
  },
  "font.lineHeight.xl": {
    displayName: "font.lineHeight.xl",
    componentTarget: "Headlines",
    description: "Große Zeilenhöhe (32px) passend zu font.size.xl.",
  },
  "font.family.base": {
    displayName: "font.family.base",
    componentTarget: "Universal Body & Controls",
    description: "Geist Sans Schriftenfamilie für maximale Lesbarkeit.",
  },
}

interface DtcgLeafNode {
  $value: string | number
  $type: "color" | "dimension" | "fontFamily" | "number"
  useFor?: string
  avoidFor?: string
  [key: string]: unknown
}

function isDtcgLeaf(node: unknown): node is DtcgLeafNode {
  return (
    typeof node === "object" &&
    node !== null &&
    "$value" in node &&
    "$type" in node
  )
}

function resolveTokenValue(
  rawValue: string | number,
  tokensRoot: Record<string, unknown>,
  visited: Set<string> = new Set()
): string {
  if (typeof rawValue !== "string") {
    return String(rawValue)
  }

  const aliasMatch = rawValue.trim().match(/^\{([^}]+)\}$/)
  if (!aliasMatch) {
    return rawValue
  }

  const aliasPath = aliasMatch[1]
  if (visited.has(aliasPath)) {
    throw new Error(
      `Zyklische Alias-Referenz in tokens.json entdeckt: "${aliasPath}" (Kette: ${[...visited, aliasPath].join(" -> ")})`
    )
  }

  const segments = aliasPath.split(".")
  let current: unknown = tokensRoot
  for (const segment of segments) {
    if (typeof current !== "object" || current === null || !(segment in current)) {
      throw new Error(
        `Ungültige Alias-Referenz: "{${aliasPath}}" konnte in tokens.json nicht aufgelöst werden. Segment "${segment}" existiert nicht.`
      )
    }
    current = (current as Record<string, unknown>)[segment]
  }

  if (!isDtcgLeaf(current)) {
    throw new Error(
      `Ungültige Alias-Referenz: "{${aliasPath}}" verweist auf keinen gültigen DTCG-Leaf mit $value und $type.`
    )
  }

  const nextVisited = new Set(visited)
  nextVisited.add(aliasPath)

  return resolveTokenValue(current.$value, tokensRoot, nextVisited)
}

function toCssVar(path: string): string {
  const kebabSegments = path
    .split(".")
    .map((seg) => seg.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase())
  return `--${kebabSegments.join("-")}`
}

function classifyTier(path: string): "semantic" | "primitive" {
  if (path.startsWith("color.")) return "semantic"
  return "primitive"
}

function classifyCategory(
  path: string,
  type: "color" | "dimension" | "fontFamily" | "number"
): "color" | "space-radius" | "typography" {
  if (path.startsWith("color.") || path.startsWith("colors.") || type === "color") {
    return "color"
  }
  if (path.startsWith("space.") || path.startsWith("radii.")) {
    return "space-radius"
  }
  if (path.startsWith("font.")) {
    return "typography"
  }
  return "color"
}

function buildTokenCatalog(
  raw: Record<string, unknown>,
  presentationMeta: Record<string, TokenPresentationMeta> = {}
): TokenItem[] {
  const leaves: Array<{ path: string; leaf: DtcgLeafNode }> = []

  function traverse(node: unknown, pathSegments: string[]) {
    if (isDtcgLeaf(node)) {
      leaves.push({ path: pathSegments.join("."), leaf: node })
      return
    }

    if (typeof node === "object" && node !== null) {
      for (const [key, value] of Object.entries(node)) {
        if (key.startsWith("$")) continue
        traverse(value, [...pathSegments, key])
      }
    }
  }

  traverse(raw, [])

  // Semantische Tokens zuerst für konsistente User Experience & stabilen Default
  leaves.sort((a, b) => {
    const tierA = classifyTier(a.path)
    const tierB = classifyTier(b.path)
    if (tierA !== tierB) {
      return tierA === "semantic" ? -1 : 1
    }
    return a.path.localeCompare(b.path)
  })

  return leaves.map(({ path, leaf }) => {
    const rawVal = leaf.$value
    const value = String(rawVal)
    const aliasMatch = typeof rawVal === "string" ? rawVal.trim().match(/^\{([^}]+)\}$/) : null
    const alias = aliasMatch ? aliasMatch[1] : undefined
    const resolvedValue = resolveTokenValue(rawVal, raw)
    const cssVar = toCssVar(path)
    const tier = classifyTier(path)
    const category = classifyCategory(path, leaf.$type)
    const meta = presentationMeta[path]

    // Fallbacks für fehlende Präsentations-Metadaten
    const name = meta?.displayName || path
    const componentTarget = meta?.componentTarget
    const description = meta?.description

    const item: TokenItem = {
      id: path,
      name,
      path,
      cssVar,
      value,
      resolvedValue,
      type: leaf.$type,
      tier,
      category,
      ...(alias ? { alias } : {}),
      ...(componentTarget ? { componentTarget } : {}),
      ...(typeof leaf.useFor === "string" ? { useFor: leaf.useFor } : {}),
      ...(typeof leaf.avoidFor === "string" ? { avoidFor: leaf.avoidFor } : {}),
      ...(description ? { description } : {}),
    }

    return item
  })
}

const TOKEN_CATALOG: TokenItem[] = buildTokenCatalog(
  rawTokens as Record<string, unknown>,
  TOKEN_PRESENTATION_META
)

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
  const [activeTab, setActiveTab] = useState<TokenFilterTab>("semantic")
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
          ...(selectedToken.description ? { $description: selectedToken.description } : {}),
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
      <PageHeader
        title="W3C Design Token Architecture"
        subtitle="Ein Token-System, das Gestaltung, Code und Agenten an dieselben freigegebenen Regeln bindet."
      />

      {/* 2-Column Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (7/12): Token Directory Card mit integrierter Toolbar */}
        <div className="lg:col-span-7 min-w-0 rounded-2xl border border-border/80 bg-card overflow-hidden shadow-xs">
          {/* Card Header Toolbar: Tabs + Search */}
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between border-b border-border/60 px-6 py-3.5 sm:py-0 sm:h-16 bg-card">
            <div className="overflow-x-auto scrollbar-none pb-0.5 sm:pb-0">
              <SegmentedTabs<TokenFilterTab>
                items={[
                  { id: "all", label: `Alle (${tabCounts.all})` },
                  { id: "semantic", label: `Semantic (${tabCounts.semantic})` },
                  { id: "primitive", label: `Primitives (${tabCounts.primitive})` },
                ]}
                value={activeTab}
                onChange={setActiveTab}
              />
            </div>

            {/* Search Input: Nutzt den verfügbaren Raum im Header */}
            <div className="relative w-full sm:flex-1 sm:max-w-xs">
              <label htmlFor="token-search" className="sr-only">
                Token, Rolle oder CSS-Variable suchen
              </label>
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground/50 pointer-events-none" />
              <input
                id="token-search"
                name="token-search"
                type="search"
                aria-label="Token, Rolle oder CSS-Variable suchen"
                placeholder="Token, Rolle oder CSS-Var suchen..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-8 pl-8.5 pr-3 text-xs bg-muted/40 border border-border/60 rounded-lg text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-primary/40 font-mono transition-shadow"
              />
            </div>
          </div>

          <div className="w-full overflow-x-auto scrollbar-thin">
            <table className="w-full min-w-[580px] text-left font-mono text-xs">
                <thead className="border-b border-border/60 bg-muted/30 text-muted-foreground text-[10px] uppercase tracking-wider">
                  <tr>
                    <th scope="col" className="py-2.5 pl-5 pr-3">Token & Rolle</th>
                    <th scope="col" className="py-2.5 px-2">Ebene</th>
                    <th scope="col" className="py-2.5 px-2">W3C Wert</th>
                    <th scope="col" className="py-2.5 pl-3 pr-5 text-right">Preview</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {filteredTokens.map((token) => {
                    const isSelected = token.id === selectedTokenId
                    return (
                      <tr
                        key={token.id}
                        aria-selected={isSelected}
                        className={`transition-colors border-l-2 ${
                          isSelected
                            ? "bg-primary/5 dark:bg-primary/10 border-primary"
                            : "border-transparent hover:bg-muted/30"
                        }`}
                      >
                        <td className="py-2 pl-5 pr-3">
                          <button
                            type="button"
                            onClick={() => setSelectedTokenId(token.id)}
                            aria-pressed={isSelected}
                            aria-label={`Token ${token.cssVar} (${token.path}) auswählen`}
                            className="w-full text-left py-1 px-1.5 -mx-1.5 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 cursor-pointer group"
                          >
                            <div className={`font-semibold text-[13px] tracking-tight transition-colors ${
                              isSelected ? "text-primary" : "text-foreground group-hover:text-primary"
                            }`}>
                              {token.cssVar}
                            </div>
                            <div className="text-[11px] text-muted-foreground mt-0.5">
                              {token.path}
                            </div>
                          </button>
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
                        <td className="py-2.5 pl-3 pr-5 text-right">
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

        {/* Right Column (5/12): Inspector, Traceability, Contrast & Code Export */}
        <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-16">
          {/* Card 1: Token-Herkunft & Komponentenbindung */}
          <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-xs space-y-4">
            <div className="border-b border-border/60 pb-3">
              <h3 className="text-sm font-semibold tracking-tight text-foreground">
                Token-Herkunft & Komponentenbindung
              </h3>
            </div>

            {/* Traceability Graph Nodes */}
            {selectedToken.tier === "semantic" ? (
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
            ) : (
              <div className="space-y-2.5">
                {/* Step 1: Primitive Token */}
                <div className="p-3 rounded-xl bg-muted/30 border border-border/60 space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-muted-foreground font-medium">1. Primitive Token</span>
                    <span className="font-mono text-primary font-medium">
                      {selectedToken.path}
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

                {/* Step 2: CSS Variable */}
                <div className="p-3 rounded-xl bg-muted/30 border border-border/60 space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-muted-foreground font-medium">2. CSS Variable</span>
                    <span className="font-mono text-[10px] text-muted-foreground">
                      Export
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

                {/* Optional Step: Component Binding nur bei tatsächlicher, konkreter Bindung */}
                {selectedToken.componentTarget && selectedToken.componentTarget !== "Raw Palette Primitive" && (
                  <>
                    <div className="flex justify-center text-muted-foreground/60 py-0.5">
                      <ArrowRight className="h-3.5 w-3.5 rotate-90" />
                    </div>
                    <div className="p-3 rounded-xl bg-muted/30 border border-border/60 space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-muted-foreground font-medium">3. Component Binding</span>
                        <span className="font-mono text-emerald-600 dark:text-emerald-400 font-medium text-[10px]">
                          Runtime Guardrail
                        </span>
                      </div>
                      <div className="text-xs font-mono font-semibold text-foreground">
                        {selectedToken.componentTarget}
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

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

          {/* Card 2: Barrierefreiheit & Kontraste (für Color Tokens) */}
          {selectedToken.type === "color" && (
            <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-xs space-y-4">
              <div className="border-b border-border/60 pb-3">
                <h3 className="text-sm font-semibold tracking-tight text-foreground">
                  Barrierefreiheit & Kontraste
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 font-mono">
                {/* Against Light Canvas */}
                <div className="p-3 rounded-xl bg-white text-zinc-950 border border-zinc-200 shadow-2xs space-y-1.5">
                  <div className="text-[10px] text-zinc-500 uppercase tracking-tight">
                    Auf Weiß (#ffffff)
                  </div>
                  <div className="text-base font-bold">
                    {contrastLight?.toFixed(2)}:1
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span
                      className={`text-[9px] px-1.5 py-0.5 rounded font-semibold ${
                        (contrastLight || 0) >= 7.0
                          ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                          : (contrastLight || 0) >= 4.5
                          ? "bg-emerald-100 text-emerald-800"
                          : (contrastLight || 0) >= 3.0
                          ? "bg-amber-100 text-amber-800"
                          : "bg-rose-100 text-rose-800"
                      }`}
                    >
                      {(contrastLight || 0) >= 7.0
                        ? "WCAG AAA (≥ 7:1)"
                        : (contrastLight || 0) >= 4.5
                        ? "WCAG AA (≥ 4.5:1)"
                        : (contrastLight || 0) >= 3.0
                        ? "WCAG Large (≥ 3:1)"
                        : "Nicht konform"}
                    </span>
                  </div>
                </div>

                {/* Against Dark Canvas */}
                <div className="p-3 rounded-xl bg-zinc-950 text-white border border-zinc-800 shadow-2xs space-y-1.5">
                  <div className="text-[10px] text-zinc-400 uppercase tracking-tight">
                    Auf Dunkel (#09090b)
                  </div>
                  <div className="text-base font-bold">
                    {contrastDark?.toFixed(2)}:1
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span
                      className={`text-[9px] px-1.5 py-0.5 rounded font-semibold ${
                        (contrastDark || 0) >= 7.0
                          ? "bg-emerald-950 text-emerald-300 border border-emerald-700"
                          : (contrastDark || 0) >= 4.5
                          ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                          : (contrastDark || 0) >= 3.0
                          ? "bg-amber-950 text-amber-300 border border-amber-800"
                          : "bg-rose-950 text-rose-300 border border-rose-800"
                      }`}
                    >
                      {(contrastDark || 0) >= 7.0
                        ? "WCAG AAA (≥ 7:1)"
                        : (contrastDark || 0) >= 4.5
                        ? "WCAG AA (≥ 4.5:1)"
                        : (contrastDark || 0) >= 3.0
                        ? "WCAG Large (≥ 3:1)"
                        : "Nicht konform"}
                    </span>
                  </div>
                </div>

                {/* Against Brand Violet Canvas */}
                <div className="p-3 rounded-xl bg-violet-950 text-violet-100 border border-violet-800 shadow-2xs space-y-1.5">
                  <div className="text-[10px] text-violet-300 uppercase tracking-tight">
                    Auf Violett (#6d28d9)
                  </div>
                  <div className="text-base font-bold">
                    {contrastOnViolet?.toFixed(2)}:1
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span
                      className={`text-[9px] px-1.5 py-0.5 rounded font-semibold ${
                        (contrastOnViolet || 0) >= 7.0
                          ? "bg-emerald-950 text-emerald-300 border border-emerald-700"
                          : (contrastOnViolet || 0) >= 4.5
                          ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                          : (contrastOnViolet || 0) >= 3.0
                          ? "bg-amber-950 text-amber-300 border border-amber-800"
                          : "bg-rose-950 text-rose-300 border border-rose-800"
                      }`}
                    >
                      {(contrastOnViolet || 0) >= 7.0
                        ? "WCAG AAA (≥ 7:1)"
                        : (contrastOnViolet || 0) >= 4.5
                        ? "WCAG AA (≥ 4.5:1)"
                        : (contrastOnViolet || 0) >= 3.0
                        ? "WCAG Large (≥ 3:1)"
                        : "Nicht konform"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Sample Live Contrast Render Pill: Fachlich korrekte Farbpaarungen */}
              {(() => {
                if (selectedToken.id === "color.border.primary.default") {
                  return (
                    <div className="p-3.5 rounded-xl border border-border/80 bg-muted/20 flex items-center justify-between transition-colors">
                      <div className="space-y-0.5">
                        <div className="text-xs font-semibold text-foreground font-mono">
                          Non-Text Contrast
                        </div>
                        <p className="text-[11px] text-muted-foreground leading-snug">
                          Rahmen- und Fokusfarbe – als Non-Text Contrast zu bewerten.
                        </p>
                      </div>
                      <div
                        className="h-6 w-6 rounded-md border-2 shrink-0 ml-3"
                        style={{ borderColor: selectedToken.resolvedValue }}
                      />
                    </div>
                  )
                }

                let title = "Live Farbpaarung"
                let fg = "#ffffff"
                let bg = selectedToken.resolvedValue
                let label = "#ffffff auf dem ausgewählten Hintergrund"

                if (
                  selectedToken.id === "color.background.primary.default" ||
                  selectedToken.id === "color.background.primary.hover"
                ) {
                  fg = "#ffffff"
                  bg = selectedToken.resolvedValue
                  label = `#ffffff auf ${selectedToken.resolvedValue}`
                } else if (selectedToken.id === "color.text.primary.default") {
                  const bgToken = TOKEN_CATALOG.find((t) => t.id === "color.background.primary.default")
                  fg = selectedToken.resolvedValue
                  bg = bgToken ? bgToken.resolvedValue : "#6d28d9"
                  label = `${selectedToken.resolvedValue} auf ${bg}`
                } else if (selectedToken.id === "color.text.destructive.default") {
                  fg = selectedToken.resolvedValue
                  bg = "#fde5e7"
                  label = `${selectedToken.resolvedValue} auf #fde5e7`
                } else {
                  // Primitive Farben
                  title = "Technischer Farbvergleich"
                  if ((contrastLight || 0) >= 4.5) {
                    bg = selectedToken.resolvedValue
                    fg = "#ffffff"
                  } else if ((contrastDark || 0) >= 4.5) {
                    bg = selectedToken.resolvedValue
                    fg = "#09090b"
                  } else {
                    bg = "#ffffff"
                    fg = selectedToken.resolvedValue
                  }
                  label = `${fg} auf ${bg}`
                }

                const ratio = calculateContrastRatio(fg, bg)
                const level =
                  ratio >= 7.0 ? "WCAG AAA" : ratio >= 4.5 ? "WCAG AA" : ratio >= 3.0 ? "WCAG Large" : "Nicht konform"

                return (
                  <div
                    className="p-3 rounded-xl border border-border/80 flex items-center justify-between transition-colors font-mono"
                    style={{
                      backgroundColor: bg,
                      color: fg,
                    }}
                  >
                    <div>
                      <div className="text-xs font-semibold">{title}</div>
                      <div className="text-[10px] opacity-85">
                        {label}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-bold">{ratio.toFixed(2)}:1</div>
                      <div className="text-[10px] font-semibold">{level}</div>
                    </div>
                  </div>
                )
              })()}
            </div>
          )}

          {/* Card 3: Multi-Target Pipeline Artifacts (Proof of Token Toolchain) */}
          <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-xs space-y-4">
            <div className="border-b border-border/60 pb-3">
              <h3 className="text-sm font-semibold tracking-tight text-foreground">
                Export für Entwickler & KI
              </h3>
            </div>

            {/* Target Format Tabs */}
            <SegmentedTabs<"json" | "css" | "ts" | "prompt">
              fullWidth
              items={[
                { id: "json", label: "W3C JSON" },
                { id: "css", label: "CSS Vars" },
                { id: "ts", label: "TS-Snippet" },
                { id: "prompt", label: "LLM-Prompt" },
              ]}
              value={exportFormat}
              onChange={setExportFormat}
            />

            {/* Code Output Viewer: Standardized Terminal Canvas */}
            <div className="relative rounded-xl border border-border/60 bg-muted/20 dark:bg-muted/10 overflow-hidden font-mono text-xs">
              {/* Code Toolbar */}
              <div className="flex items-center justify-between border-b border-border/60 px-4 py-2 bg-card/60">
                <div className="flex items-center gap-2 text-[11px] font-mono text-muted-foreground">
                  <Terminal className="h-3.5 w-3.5 text-primary" />
                  <span className="text-foreground font-semibold">
                    {exportFormat === "json"
                      ? "tokens.json"
                      : exportFormat === "css"
                      ? "tokens.css"
                      : exportFormat === "ts"
                      ? "Snippet: TypeScript"
                      : "Prompt: LLM-Regel"}
                  </span>
                  <span className="opacity-40">•</span>
                  <span>{exportFormat === "ts" ? "TS" : exportFormat.toUpperCase()}</span>
                </div>

                <button
                  type="button"
                  onClick={handleCopyExport}
                  aria-label={copiedFormat ? "Code in die Zwischenablage kopiert" : `${exportFormat.toUpperCase()} Code in Zwischenablage kopieren`}
                  className="inline-flex items-center gap-1 rounded px-2 py-0.5 text-[11px] text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                  title="Code kopieren"
                >
                  {copiedFormat ? (
                    <>
                      <Check className="h-3 w-3 text-emerald-500" />
                      <span className="text-emerald-500 font-medium">Kopiert</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" />
                      <span>Kopieren</span>
                    </>
                  )}
                </button>
              </div>

              {/* Code Pre: Soft-wrapping verhindert horizontales Scrollen im schmalen Panel */}
              <pre className="p-4 text-[12px] leading-relaxed text-foreground/90 overflow-y-auto h-52 whitespace-pre-wrap break-words">
                <code>{exportCode}</code>
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
