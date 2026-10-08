# A2UI-Experiment: Design System als Trusted Catalog

Frage: Reicht ein Katalog, der aus den vorhandenen Komponenten-Metadaten abgeleitet ist, damit ein Agent eine Sign-up-Seite baut, die das Design System einhält? Was fängt das Schema, was nicht?

Stand: 2026-10-08. Protokoll A2UI v0.9 (Messages `createSurface` / `updateComponents` / `updateDataModel`), Pakete `@a2ui/react` und `@a2ui/web_core` 0.12.0.

## Aufbau

| Datei | Ebene | Inhalt |
|---|---|---|
| `catalog.api.ts` | Schema | Zod-Schemas für Column, Headline, FormField, Button. `.strict()`, `allowedChildren`/`allowedParents`, Regeln in `.describe()` |
| `catalog.tsx` | Implementierung | Mapping auf die echten `Button`/`FormField`-Komponenten |
| `design-rules.ts` | Eigene Regeln | Was das Schema nicht ausdrücken kann, als Code |
| `fixtures.ts` | Testfälle | 12 Nachrichtenströme, einer gültig, elf gezielt kaputt oder grenzwertig |
| `check.ts` | Prüfer | `node src/a2ui/check.ts` |
| `signup.stories.tsx` | Sichtprüfung | Storybook: Agent-Nachrichten rendern mit echten Komponenten |

**Einschränkung:** Der "Agent" ist eine Claude-Code-Session, die die Nachrichtenströme von Hand aus Katalog und Guidelines erzeugt hat. Es gibt keinen produktiven LLM-Aufruf. Die Fixtures sind also Stichproben, keine Messung, wie oft ein echtes Modell welchen Fehler macht.

## Ergebnis (11 von 12 Fällen wie erwartet)

**Das Schema setzt durch (5 Fälle):** erfundene Komponente, Rohwert per `className`, Variante `secondary`, fehlendes Pflicht-Label, verschachtelte Column (über `allowedChildren`). Das erledigt der offizielle `MessageProcessor` ohne eigenen Code.

**Eigene Regeln nötig (5 Fälle):** zwei `primary`-Buttons, Button vor den Feldern, Passwortfeld als `text`, drei Headlines, Submit ohne Formulardaten. Alle fünf sind gültiges JSON gegen den Katalog. Vier davon sind zählbar oder strukturell und deshalb belastbar. Das Passwort-Feld ist eine Heuristik über das Label und fragil.

**Nicht lösbar (1 Fall):** `destructive` für "Cancel". Ob eine Aktion zerstörerisch ist, ist Semantik. Ein Schema kann es nicht, eine Regel nur über Wortlisten.

**Zwei Befunde, die nicht aus den Fixtures kamen:**

1. Die Katalog-Implementierung kann Wissen aufnehmen, das bisher in Prosa stand. `button.guidelines.md` verlangt `h-auto p-0` für `variant="link"`. Das passiert jetzt in `catalog.tsx`, der Agent muss es nicht wissen und kann es nicht vergessen.
2. Erst beim Rendern aufgefallen: Mein eigener "gültiger" Sign-up hatte keine Formulardaten an die Submit-Aktion gebunden. Der Klick schickte `context: {}`. Das Schema lässt das zu. Seitdem prüft eine Regel, dass die primäre Aktion jeden `FormField`-Pfad bindet.

## Grenzen dieser Zahlen

Die Regeln in `design-rules.ts` wurden geschrieben, **nachdem** die Lücken bekannt waren. "11 von 12" ist deshalb kein Nachweis, dass sie unbekannte Fehler fangen. Belastbar ist nur die Einteilung: Was war überhaupt als Regel formulierbar?

## Offen

- Ein echter Agent-Durchlauf (LLM bekommt nur Katalog-Schema und Prompt, kein Zugriff auf die Guidelines), um zu sehen, welche Fehler real auftreten
- Katalog-JSON-Schema exportieren (`catalog.catalogSchema`) und gegen die `meta.json`-Quelle abgleichen, damit Katalog und Metadaten nicht auseinanderlaufen
- A2UI v1.0 (Candidate) hat Funktionsaufrufe in beide Richtungen und entfernt Theme-Felder. Der Katalog ist auf v0.9 gebaut
