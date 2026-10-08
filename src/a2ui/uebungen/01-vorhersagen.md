# Übung 1: Vorhersagen

Für jede Änderung: **erst die Vorhersage eintragen, dann ändern und `node src/a2ui/check.ts` ausführen.** Der Prüfer zeigt ganz unten, wie viele Fälle wie erwartet sind, und davor, welche Fälle als `LÜCKE` markiert sind. Heute steht dort `11/12`, nur Fall 08 ist eine Lücke.

## Änderung A: Regel entfernen

Datei `design-rules.ts`: Mach die Regel `max-ein-primary` unwirksam (zum Beispiel, indem du ihren `check` immer `null` zurückgeben lässt).

- **Vorhersage:** Welche Fälle werden zu `LÜCKE`? Wie viele von 12 sind dann wie erwartet?
- **Ergebnis:**
- **Warum?** (ein Satz)

## Änderung B: Heuristik austricksen

Datei `fixtures.ts`, Fall `09 Passwort als Klartextfeld`: Ändere das Label des Passwortfelds von `Password` auf `Geheimwort`. Tipp: Das Feld entsteht aus `{ ...pwField, type: "text" }`, du kannst dort `label: "Geheimwort"` ergänzen.

- **Vorhersage:** Wird der Fall noch abgelehnt? Von welcher Ebene?
- **Ergebnis:**
- **Was sagt das über Regeln aus, die auf Wörter achten?**

## Änderung C: Strenge abschalten

Datei `catalog.api.ts`: Entferne bei `ButtonApi` das `.strict()` am Ende des Schemas.

- **Vorhersage:** Welcher Fall kippt? Warum genau dieser?
- **Ergebnis:**
- **Was hat `.strict()` bisher verhindert?**

## Zum Schluss

Setz alles zurück: `git restore src/a2ui`

Dann beantworte in zwei Sätzen: Welche der drei Änderungen war am gefährlichsten, weil man sie nicht bemerken würde?
