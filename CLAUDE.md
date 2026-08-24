# agentic-design-system-playground

Agentic, KI-lesbares Design System: Tokens und Komponenten, die ein AI-Agent korrekt lesen und verwenden kann, statt Werte zu raten.

## Regeln für Agents

**Grundregel:** Farb-, Spacing-, Radius- und Typography-Werte immer aus `src/tokens/tokens.json` lesen (W3C Design Tokens Format, `$value`/`$type`). Nie selbst einen Wert erfinden oder schätzen — fehlt ein passendes Token, nachfragen statt setzen.

**Zwei Ebenen, nicht verwechseln:**
- **Primitive** (Rohwerte, kein Verwendungszweck): `[Property (Plural)].[Group].[Option]` — z. B. `colors.blue.500`, `colors.gray.100`
- **Semantic** (Verwendungszweck, referenziert Primitives): `[Property].[Subcategory].[Role].[State]` — z. B. `color.background.primary.hover` → `{colors.blue.500}`
- **Component** (erst ab der zweiten Komponente relevant): `[Component].[Element].[Property].[Role].[State]` — z. B. `button.text.color.primary.active`

**Naming-Regeln:**
- Punkt-Notation (`.`), keine Schrägstriche — kein Figma-Variablen-Sync in diesem Projekt
- Nur States anlegen, die tatsächlich verwendet werden (kein `active`/`focus` auf Vorrat, falls ungenutzt)
- Keine konkreten Werte im Namen (`spacing-8px`, `color-blue` ❌) — Skalen/Rollen statt Werte
- Keine Verschachtelung über die drei oben gezeigten Ebenen hinaus
- Future-friendly: keine Namen, die sich an aktuelles Aussehen koppeln (`button.tier-2` statt `button.outlined`, falls sich das Aussehen später ändern könnte)

**Intent-Metadaten:** Rollen-/Farb-Tokens mit echtem Verwechslungsrisiko tragen zusätzlich `useFor`/`avoidFor` als kurzes Freitextfeld im Token-Objekt (nicht im Namen). Vor Verwendung eines solchen Tokens gegen `useFor`/`avoidFor` prüfen. Nicht bei jedem Spacing-/Radius-Token nötig — nur wo Verwechslung plausibel ist (primär Farb-/Rollen-Tokens).

**Komponenten:** Basis ist shadcn/ui (headless/unstyled), nicht from-scratch gebaut. Code wird von Andreas selbst geschrieben, der Agent ist Pair-Programming-Partner und Reviewer, nicht alleiniger Autor.
