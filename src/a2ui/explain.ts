// Übersetzt rohe Prüferfehler (A2UI-Processor und eigene Regeln) in Klartext:
// warum wurde abgelehnt, und was müsste der Agent stattdessen tun.
// Deckt nur bekannte Fehlerarten ab. Alles andere kommt unverändert zurück.
export type Explanation = { why: string; fix: string }

const variantHints: Record<string, string> = {
  secondary: "Laut button.guidelines.md gilt für neuen Code `outline`, `secondary` wird nicht mehr eingesetzt.",
}

export function explain(raw: string): Explanation | null {
  let m = raw.match(/Unrecognized key\(s\) in object: '([^']+)'/)
  if (m) {
    const [, key] = m
    return {
      why: `Die Eigenschaft '${key}' gibt es im Katalog nicht. Der Agent darf keine Stile oder Klassen setzen, nur Bausteine und Varianten.`,
      fix: "Eine vorhandene Variante wählen, zum Beispiel variant: primary.",
    }
  }
  m = raw.match(/Invalid enum value\. Expected ([^,]+), received '([^']+)'/)
  if (m) {
    const allowed = m[1].split(" | ").join(", ")
    return {
      why: `'${m[2]}' ist hier nicht erlaubt. ${variantHints[m[2]] ?? ""}`.trim(),
      fix: `Einen erlaubten Wert nehmen: ${allowed}.`,
    }
  }
  m = raw.match(/component '(\w+)' \(\w+\): (\w+): Expected \w+, received undefined/)
  if (m) {
    return { why: `Bei ${m[1]} fehlt das Pflichtfeld '${m[2]}'.${m[2] === "label" ? " Ohne Beschriftung wäre das Feld für Screenreader unbenannt." : ""}`, fix: `'${m[2]}' setzen.` }
  }
  m = raw.match(/Unknown component type '([^']+)'/)
  if (m) {
    return { why: `Den Baustein '${m[1]}' gibt es im Katalog nicht.`, fix: "Nur Column, Headline, FormField oder Button verwenden." }
  }
  m = raw.match(/\((\w+)\) cannot contain child '[^']*' \((\w+)\)/)
  if (m) {
    return { why: `${m[1]} darf kein ${m[2]} enthalten.`, fix: "Die Kinder auf erlaubte Bausteine beschränken." }
  }
  m = raw.match(/max-ein-primary: (\d+)/)
  if (m) {
    return {
      why: `Die Seite hat ${m[1]} primäre Buttons. Bei zwei gleich starken Hauptaktionen verliert jede ihre Signalwirkung.`,
      fix: "Eine Aktion primary lassen, die andere als outline oder link anlegen.",
    }
  }
  if (raw.startsWith("genau-eine-headline")) {
    return { why: "Eine Seite braucht genau eine Überschrift.", fix: "Genau eine Headline verwenden und überzählige entfernen." }
  }
  if (raw.startsWith("aktionen-nach-feldern")) {
    return { why: "Ein Button steht über einem Eingabefeld. Aktionen gehören ans Ende des Formulars.", fix: "Die Buttons in der Column nach unten setzen." }
  }
  if (raw.startsWith("passwort-feld-typ")) {
    return { why: "Ein Passwortfeld würde im Klartext angezeigt.", fix: "type: password setzen." }
  }
  if (raw.startsWith("submit-traegt-formdaten")) {
    return { why: "Der Absenden-Button schickt keine Formulardaten an den Agenten.", fix: "Im context der Action jeden Feldpfad binden, zum Beispiel {\"email\": {\"path\": \"/email\"}}." }
  }
  return null
}
