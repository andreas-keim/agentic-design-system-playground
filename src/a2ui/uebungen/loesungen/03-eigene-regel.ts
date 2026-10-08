// Musterlösung zu Übung 3. Erst nach eigenem Versuch ansehen.
export type Comp = { id: string; component: string; [key: string]: unknown }

// \b = Wortgrenze: "Email", "E-Mail", "E-Mail-Adresse" treffen, "Mailing-Liste" nicht.
const emailLabel = /\be-?mail\b/i

export function emailFeldTyp(components: Comp[]): string | null {
  const bad = components.find(
    (c) => c.component === "FormField" && emailLabel.test(String(c.label)) && (c.type ?? "text") !== "email",
  )
  return bad ? `FormField '${bad.label}' sieht nach E-Mail aus, type ist '${bad.type ?? "text"}'` : null
}

// Grenzen dieser Regel (gehören zur Lösung):
//  - Heuristik über das Label: "Kontaktadresse" oder "Mail" allein wird nicht erkannt.
//  - Englisch und Deutsch sind abgedeckt, andere Sprachen nicht.
//  - Sie prüft nur den Typ, nicht ob der Agent überhaupt ein E-Mail-Feld braucht.
