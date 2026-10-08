// Übung 3: Schreib eine eigene Regel.
//
// Ausgangslage: design-rules.ts prüft schon, ob ein Passwortfeld type "password" hat.
// Es fehlt das Gegenstück für E-Mail: Ein FormField, dessen Label nach E-Mail aussieht,
// muss type "email" haben (sonst fehlt Tastatur und Autofill auf dem Handy).
//
// Aufgabe: Implementier `emailFeldTyp`. Sie bekommt alle Komponenten einer Seite und
// gibt einen Fehlertext zurück (String) oder null, wenn alles passt.
//
// Spielregeln:
//  - Nur FormField Komponenten prüfen (component === "FormField"), keine Buttons.
//  - Ein fehlendes `type` zählt als "text" (so rendert der Katalog es auch).
//  - Beachte die Testfälle in pruefe.ts, sie enthalten eine Falle.
//  - Starte den Selbsttest mit: node src/a2ui/uebungen/pruefe.ts
//
// Zum Nachdenken, wenn es grün ist: Wie fragil ist deine Regel? Was bleibt unerkannt?

export type Comp = { id: string; component: string; [key: string]: unknown }

export function emailFeldTyp(_components: Comp[]): string | null {
  // TODO: hier deine Regel
  return null
}
