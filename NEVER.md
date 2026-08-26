# NEVER — Negativregeln für Agenten in diesem Repo

Explizite "Don't"-Liste nach dem Vorbild von Freya Stockmans (Relevance AI) "Don't file" und Romina Kavcics Governance-als-Negativliste-Idee (beide über [intodesignsystems.com](https://www.intodesignsystems.com/vibe-coding)). Anders als dort **nicht generisch übernommen** — jede Regel hier ist aus einem tatsächlich in diesem Projekt gefundenen und behobenen Bug abgeleitet, nicht erfunden. Vor jedem `git push` gegenlesen (siehe `.claude/skills/wrap-up`).

## Tokens & Werte

- **Nie einen Farb-/Spacing-/Radius-/Typography-Wert erfinden oder schätzen.** Fehlt ein passendes Token in `src/tokens/tokens.json`, nachfragen statt setzen (CLAUDE.md-Grundregel).
- **Nie einen Rohwert (Hex, px, willkürliches Tailwind-Arbitrary-Value) verwenden, wenn ein äquivalentes Token existiert** — auch wenn der Rohwert zufällig identisch aussieht. *(Step 2: Button-Padding/Gap/Font-Metriken hingen an Tailwinds eigener Skala statt an eigenen Tokens — sah lange identisch aus, war es aber nicht.)*
- **Nie eine Komponente nur teilweise tokenisieren und den Rest stillschweigend bei einem Framework-Default belassen.** Jede Property, die ein Token haben könnte, explizit prüfen — nicht nur die auffälligsten (Farbe/Radius). *(Step 2, derselbe Fund.)*

## Dokumentation & Metadaten

- **Nie eine Beziehung, ein Verhalten oder eine Design-Entscheidung in `*.guidelines.md`/`*.mdx` behaupten, die sich nicht 1:1 im aktuellen Code nachvollziehen lässt.** *(Step 3: `button.guidelines.md` behauptete, der Button-Group-Kontext runde nur die äußeren Ecken ab — der Code hatte diese Logik nie.)*
- **Nie eine ungenutzte Design-Entscheidung mit einer unverifizierten Analogie zu einer früheren rechtfertigen.** Erst den früheren Fall nachschlagen, dann vergleichen. *(Step 3: die `outline`-Notiz verglich sich fälschlich mit den in Step 2 tatsächlich gelöschten Disabled-Tokens.)*
- **Nie zwei visuell identische Varianten/Optionen ohne explizite Tie-Breaker-Regel für Agenten stehen lassen**, auch wenn die eigentliche Design-Entscheidung noch offen ist. Eine Interims-Regel ("bei neuem Code X verwenden, Y nicht weiter einsetzen") ist besser als stiller Ermessensspielraum. *(Step 5b: `outline`/`secondary` waren beide gültig, aber ohne Vorgabe.)*
- **Nie einen Zustand/eine Beziehung als existierend annehmen, nur weil ein ähnliches System (z. B. Primer) sie hat.** Explizit im jeweiligen `*.guidelines.md` vermerken, wenn etwas *nicht* implementiert ist (siehe `button.guidelines.md`, Abschnitt "Nicht (fälschlich) annehmen").

## Live-Systeme & destruktive Aktionen

- **Nie einen stillen Fallback-Default in eine Sicherheitsschranke einbauen, die vor einer mutierenden Aktion auf einem externen/live System steht.** Der Erwartungswert muss explizit gesetzt sein (z. B. als Pflicht-Env-Var), nicht aus Zufall stammen. *(Step 2b: `FIGMA_DOCUMENT_NAME` hatte einen stillen `|| 'Gamified activity'`-Fallback.)*
- **Nie eine löschende/destruktive Skript-Aktion standardmäßig scharf schalten.** Dry-Run ist der Default, echtes Löschen nur mit explizitem Flag. *(Step 2b: `pruneOrphanedVariables()`, `FIGMA_PRUNE_UNUSED=1`.)*
- **Nie "sieht falsch aus" sofort mit einer Werteänderung beheben, ohne vorher Property-für-Property gegen ein korrekt renderndes Geschwister zu vergleichen.** Ein Rendering-/Client-Cache-Bug kann trotz korrekter Daten auftreten. *(Step 5, Abschluss-Audit: Figma-Render-Cache-Bug bei frisch geklonten, unveränderten Komponenten.)*

## Komponenten & Struktur

- **Nie einen neuen State/eine neue Variante "auf Vorrat" anlegen, die aktuell nirgends verwendet wird** (CLAUDE.md-Grundregel, mehrfach bestätigt: Step 2b hat genau solche verwaisten Primitives per Prune-Skript wieder entfernt).
- **Nie eine neue Button-Implementierung bauen, wenn die bestehende `Button`-Komponente das Bedürfnis abdeckt** — auch nicht für einen Testfall oder eine Demo-Komponente. *(Step 5: beide A/B-Testagenten haben das korrekt eingehalten, war aber nie explizit als Regel niedergeschrieben, nur implizit erwartet.)*

## CI

- **Nie in einer GitHub-Actions-`run`-Zeile einen Befehl, dessen Exit-Code über grün/rot entscheidet, ungeschützt durch `| tee ...` (oder eine andere Pipe) schicken.** Ohne `set -o pipefail` liefert die Shell den Exit-Code des letzten Pipe-Glieds (`tee` = immer 0), nicht den des eigentlichen Befehls — ein fehlschlagender Test wird so als "grün" gemeldet. *(Step 6d/e: der Accessibility-Workflow zeigte "success", obwohl der Test intern Violations meldete — `npm run test:a11y 2>&1 | tee a11y-report.txt` ohne `pipefail`.)*

## Wie diese Liste wächst

Nur Einträge aufnehmen, die auf einen tatsächlichen, im Playbook dokumentierten Fund zurückgehen — keine generischen Best-Practice-Regeln aus Artikeln kopieren, das würde die Liste beliebig lang und damit wirkungslos machen (siehe [[Playbook Step 5c]] im Vault für die Quellenlage). Neuer Fund → neue Regel → hier + im Playbook dokumentiert.
