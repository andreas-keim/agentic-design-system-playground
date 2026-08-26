# Step 5 — Agent-Testschleife: Validierungsbericht

Testet die Kernannahme des Playbooks (Step 5): Ein Agent, der `button.meta.json`/`button.guidelines.md` als Kontext bekommt, verwendet die Pilot-Komponente korrekt statt Werte/Varianten zu erfinden. Methodik und vollständige Ergebnisse: siehe Playbook-Eintrag im Vault (`04 Ressourcen/Design Systems/Playbook Schritt 5 - Agent-Testschleife.md` bzw. der zugehörige Abschnitt in `Playbook - Neues Design-System-Projekt.md`).

## Aufbau

Zwei unabhängige Agenten (frischer Kontext, kein Bezug zueinander), identische Aufgabe, in isolierten Git-Worktrees vom selben `main`-Stand:

- **Aufgabe:** Baue `src/components/edit-entry-panel.tsx` — ein Panel mit Text-Eingabefeld und drei Aktionen (Speichern / Abbrechen / Eintrag endgültig löschen), eingebunden in `App.tsx`. Kein neues Styling erfinden, bestehendes Design System nutzen.
- **Bedingung A — organic** (Branch `step-5-agent-test-organic`, nicht gemerged): bekommt nur die Aufgabe, keinen Hinweis auf `button.meta.json`/`button.guidelines.md`. Testet, ob die Metadaten auch ungefragt gefunden und angewendet werden.
- **Bedingung B — explicit** (Branch `step-5-agent-test-explicit`, dieser Merge): wird explizit angewiesen, vor der Implementierung `button.meta.json` und `button.guidelines.md` zu lesen und sich daran zu halten.

## Ergebnis

Beide Agenten fanden und lasen die Metadaten-Dateien — auch Bedingung A, ohne dazu aufgefordert worden zu sein (im Rahmen der eigenen Repo-Exploration, u. a. über die generische Datei-Konvention aus `CLAUDE.md`). Beide Ergebnisse: `npm run build` und `npm run lint` grün (unabhängig verifiziert, nicht nur laut Agenten-Eigenbericht), keine neue Button-Implementierung, keine erfundenen Hex-/Px-Werte, alle drei Button-Varianten korrekt gemäß `button.guidelines.md`:

| Kriterium | Bedingung A (organic) | Bedingung B (explicit) |
|---|---|---|
| Button wiederverwendet statt neu gebaut | ✅ | ✅ |
| `variant="primary"` für Speichern | ✅ | ✅ |
| `variant="outline"` für Abbrechen | ✅ | ✅ |
| `variant="destructive"` für Löschen | ✅ | ✅ |
| Keine erfundenen Farb-/Spacing-Werte | ✅ | ✅ |
| Kein erfundener `inactive`-Zustand | ✅ | ✅ |
| Build/Lint grün | ✅ | ✅ |
| Cancel setzt den Eingabewert lokal zurück | ❌ (Bug, siehe unten) | ✅ |
| Input-Feld nutzt bestehendes Headless-Primitive (`@base-ui/react/input`, analog zu `ButtonPrimitive` in `button.tsx`) statt Rohimplementierung | ❌ (baut ein rohes `<input>`, repliziert Fokus-Styles manuell) | ✅ |

**Kernbefund:** Die Grundannahme des Playbooks bestätigt sich — beide Agenten haben die Pilot-Komponente korrekt und ohne Erfindung verwendet, die Metadaten waren wie gedacht ausreichend. Der Unterschied zwischen den Bedingungen lag nicht in der Varianten-Korrektheit (die war in beiden Fällen bereits durch generische Repo-Exploration erreichbar), sondern in zwei subtileren Punkten:

1. Bedingung A hat einen echten, unabhängig vom Design-System-Kontext bestehenden Funktionsfehler: Der lokale Eingabe-State (`draft`) wird beim Klick auf "Abbrechen" nicht zurückgesetzt — der Button reicht `onCancel` nur unverändert an die aufrufende Stelle durch, ohne den sichtbaren Feldwert zu korrigieren. Kein Zusammenhang mit den Button-Metadaten selbst, aber ein Beleg dafür, dass Guideline-Konsum allein keine allgemeine Code-Korrektheit garantiert.
2. Bedingung B hat den in `button.meta.json` dokumentierten Aufbau-Pattern (Styling-Wrapper um ein Base-UI-Headless-Primitive) auf das neue Eingabefeld übertragen, Bedingung A nicht. Das ist der einzige Punkt, an dem sich der explizite Hinweis auf die Metadaten-Dateien sichtbar in einer strukturellen statt nur oberflächlichen Umsetzungsqualität niederschlägt.

**Einordnung — deckt sich mit Miros "Aura"-Erfahrung** (Andressa Lombardo/Eddie Machado, [intodesignsystems.com/blog/miro-ai-design-system-mcp-claude-code-skills](https://www.intodesignsystems.com/blog/miro-ai-design-system-mcp-claude-code-skills)): Halluzinationen/Fehlnutzung sind bei gut gepflegter Metadaten-Lage in erster Linie ein Kontext-, kein Modellproblem — hier bereits ohne jede explizite Verlinkung reproduzierbar vermieden, weil die Metadaten discoverable genug waren. Offen bleibt (Step 6), ob das bei mehr Komponenten/mehr Ablenkung im Kontext noch trägt, oder ob dann — wie bei Miro — eine explizite Routing-Instruktion nötig wird.

Vollständige Diffs: `git diff main step-5-agent-test-organic` bzw. der Merge-Commit dieses Branches für Bedingung B.
