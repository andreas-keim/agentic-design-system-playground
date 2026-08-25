# Button — Nutzungsrichtlinien

Button löst eine Aktion aus einer Seite oder einem Formular aus. Struktur/Props/Token-Bindung stehen in [`button.meta.json`](./button.meta.json) — diese Datei beschreibt, wann welche Variante angemessen ist und wie Button mit anderen Elementen zusammenspielt.

## Varianten — wann welche

- **primary**: die eine primäre Aktion in einem Flow (z. B. "Speichern", "Absenden"). Nicht mehr als eine `primary`-Instanz gleichzeitig sichtbar — sonst verliert sie ihre Signalwirkung.
- **outline** / **secondary**: sekundäre Aktion neben einer `primary`-Aktion (z. B. "Abbrechen" neben "Speichern"). Beide aktuell visuell sehr ähnlich (kein eigenes Token unterscheidet sie) — Wahl zwischen beiden ist noch keine bewusste Design-Entscheidung, sondern shadcn-Default. Vormerken für eine spätere Abgrenzung.
- **ghost**: niedrigste Betonung, für Aktionen in dichten Kontexten (Toolbars, Tabellenzeilen), wo ein sichtbarer Rand/Fill zu viel Gewicht hätte.
- **destructive**: ausschließlich für zerstörerische Aktionen (Löschen, unwiderrufliches Entfernen). Nicht für "Abbrechen" oder andere negative, aber nicht-destruktive Aktionen.
- **link**: für Aktionen, die sich wie Inline-Text-Navigation verhalten sollen, nicht wie ein "echter" Button-Look (kein Fill/Rand).

## Beziehungen zu anderen Elementen (Stand: nur im Code vorbereitet, keine eigene Komponente existiert bisher)

- **Button-Group-Kontext**: Innerhalb eines Containers mit `data-slot="button-group"` bekommen die kleinen Sizes (`xs`/`sm`/`icon-xs`/`icon-sm`) statt ihres sonst geklemmten kleineren Radius den vollen `rounded-lg` — **keine** Positions-/Ecken-Logik (kein first-child/last-child), jeder Button in der Gruppe wird einheitlich behandelt. Es gibt aktuell **keine eigene `ButtonGroup`-Komponente** im Projekt — dieses Verhalten ist vorbereitet, aber ungetestet, solange keine Gruppe existiert.
- **Icon-Pairing**: Ein Kind-Element mit `data-icon="inline-start"` oder `data-icon="inline-end"` reduziert automatisch das Padding auf der jeweiligen Seite. Setzt voraus, dass der Aufrufer dieses Datenattribut selbst auf das Icon-Element setzt — Button erzwingt es nicht.

## Nicht (fälschlich) annehmen

- Es gibt **keinen `inactive`-Zustand** (nur `disabled`) — GitHub Primer unterscheidet beide bewusst (`disabled` schließt Tastaturnutzer aus, `inactive` bleibt fokussierbar), aber das ist für dieses Projekt aktuell nur ein vorgemerkter Punkt im Playbook, nicht implementiert. Nicht so verwenden, als existiere die Unterscheidung schon.
