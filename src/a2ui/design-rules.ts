// Ebene 2: Regeln aus den Guidelines, die ein JSON-Schema nicht ausdrücken kann.
// Jede Regel nennt ihre Quelle und wie belastbar sie ist. Absichtlich NICHT
// umgesetzt: "destructive nur für Zerstörendes" (rein semantisch, siehe README-Befund).
type Comp = { id: string; component: string; [k: string]: unknown }

function collect(messages: unknown[]): Comp[] {
  const out: Comp[] = []
  for (const m of messages as { updateComponents?: { components: Comp[] } }[]) {
    if (m.updateComponents) out.push(...m.updateComponents.components)
  }
  return out
}

const rules: { name: string; source: string; check: (c: Comp[]) => string | null }[] = [
  {
    name: "max-ein-primary",
    source: "button.guidelines.md: nicht mehr als eine primary-Instanz sichtbar (zählbar, belastbar)",
    check: (c) => {
      const n = c.filter((x) => x.component === "Button" && (x.variant ?? "primary") === "primary").length
      return n > 1 ? `${n} primary-Buttons, erlaubt ist 1` : null
    },
  },
  {
    name: "genau-eine-headline",
    source: "Katalog-Beschreibung Headline: genau eine pro Seite (zählbar, belastbar)",
    check: (c) => {
      const n = c.filter((x) => x.component === "Headline").length
      return n !== 1 ? `${n} Headlines, erwartet genau 1` : null
    },
  },
  {
    name: "aktionen-nach-feldern",
    source: "Katalog-Beschreibung Column: Aktionen zuletzt (Reihenfolge der Root-Kinder, belastbar)",
    check: (c) => {
      const root = c.find((x) => x.id === "root")
      const order = ((root?.children as string[]) ?? []).map((id) => c.find((x) => x.id === id)?.component)
      const firstButton = order.indexOf("Button")
      const lastField = order.lastIndexOf("FormField")
      return firstButton !== -1 && lastField > firstButton ? "FormField steht nach einem Button" : null
    },
  },
  {
    name: "submit-traegt-formdaten",
    source: "Beim Rendern gefunden: Action eines primary-Buttons muss jeden FormField-Pfad im context binden (belastbar)",
    check: (c) => {
      const paths = c.filter((x) => x.component === "FormField").map((x) => (x.value as { path?: string })?.path)
      const btn = c.find((x) => x.component === "Button" && (x.variant ?? "primary") === "primary")
      if (!paths.length || !btn) return null
      const ctx = JSON.stringify((btn.action as { event?: { context?: unknown } })?.event?.context ?? {})
      const missing = paths.filter((p) => p && !ctx.includes(p))
      return missing.length ? `primary-Action bindet ${missing.join(", ")} nicht im context` : null
    },
  },
  {
    name: "passwort-feld-typ",
    source: "Katalog-Beschreibung FormField: Passwörter als 'password' (Heuristik über das Label, FRAGIL)",
    check: (c) => {
      const bad = c.find(
        (x) => x.component === "FormField" && /pass(wort|word)|kennwort/i.test(String(x.label)) && x.type !== "password",
      )
      return bad ? `FormField '${bad.label}' sieht nach Passwort aus, type ist '${bad.type ?? "text"}'` : null
    },
  },
]

export function designRules(messages: unknown[]): string | null {
  const c = collect(messages)
  for (const r of rules) {
    const hit = r.check(c)
    if (hit) return `${r.name}: ${hit}`
  }
  return null
}
export const ruleCatalog = rules.map(({ name, source }) => ({ name, source }))
