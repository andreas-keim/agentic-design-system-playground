---
name: wrap-up
description: Checks and merges a finished feature/step branch of this design-system project into main — build/lint (and Storybook build if stories changed), a project-specific consistency checklist, a commit message, and a --no-ff merge with branch cleanup. Use when a branch's implementation work is done and ready to land on main. Not for work still in progress.
---

# Wrap-up

Formalisiert den Merge-Ablauf, den dieses Projekt seit Step 2 manuell wiederholt hat (Branch → Checks grün → Commit → `--no-ff`-Merge → Branch löschen). Nach Vorbild von Miros `wrap-up`-Skill ([intodesignsystems.com/blog/miro-ai-design-system-mcp-claude-code-skills](https://www.intodesignsystems.com/blog/miro-ai-design-system-mcp-claude-code-skills)): "creating a PR sucks, so the skill does it for you" — hier: kein PR-Flow (Solo-Repo, direkter Merge nach `main`), aber derselbe Gedanke auf unseren tatsächlichen Ablauf übertragen.

## Ablauf

1. **Builds/Checks laufen lassen, alle müssen grün sein:**
   - `npm run build`
   - `npm run lint`
   - Falls `*.stories.tsx`/`*.mdx` in diesem Branch geändert wurden: zusätzlich `npm run build-storybook`
   - Falls `src/tokens/tokens.json` oder eine Komponente mit Figma-Parität (`figmaParityCheck` in der jeweiligen `*.meta.json`) geändert wurde: `npm run tokens:build` und `figma-cli check` (Safe Mode, Plugin muss manuell in Figma laufen — falls das nicht möglich ist, explizit als offen vermerken statt zu überspringen)

2. **Projekt-spezifische Konsistenz-Checkliste** (aus tatsächlich in diesem Projekt gefundenen Bugs abgeleitet, nicht generisch):
   - Jeder neue/geänderte Farb-/Spacing-/Radius-/Typography-Wert kommt aus `src/tokens/tokens.json` — keine erfundenen/geschätzten Werte, keine Hex-Farben, keine willkürlichen Tailwind-Arbitrary-Values außerhalb bestehender CSS-Variablen (Step-2-Bug: Button war nie vollständig tokenisiert).
   - Wenn eine Komponente in `src/components/ui/` geändert wurde: die zugehörige `*.meta.json` und `*.guidelines.md` auf denselben Stand gebracht — jeder `var(--...)`-Aufruf im Code hat eine Entsprechung im Meta-JSON (Step-3-Lektion: Metadaten-Drift ist selbst ein Bug).
   - Keine neuen States/Varianten "auf Vorrat" angelegt, die nirgends verwendet werden (CLAUDE.md-Regel).
   - Keine Behauptung in `*.guidelines.md` oder `*.mdx`, die sich nicht 1:1 im aktuellen Code nachvollziehen lässt (Step-3-Fund: erfundene Button-Group-Ecken-Logik, die es im Code nie gab).
   - Bei widersprüchlichen oder unentschiedenen Regeln (z. B. zwei Varianten ohne Abgrenzung): eine explizite Interims-Regel statt stillem Ermessensspielraum festhalten (Step-5b-Lektion, "be consistent"-Prinzip aus dem Miro-Talk).

3. **Commit-Message** im Stil der bisherigen Historie: kurzer, deutschsprachiger Titel, der beschreibt was gemacht wurde, bei Funden in Klammern/Doppelpunkt ergänzt (z. B. "Step 5: Validierungsbericht für den A/B-Agententest" oder "Fix: link-Varianten-Notiz referenzierte noch 'default-Variante'"). Kein Conventional-Commits-Prefix, das ist bisher nirgends in der Historie verwendet worden.

4. **Kurze Zusammenfassung** (ersetzt eine PR-Beschreibung, da kein GitHub-PR-Flow genutzt wird): was geändert wurde, welche Checks liefen, was noch offen/nicht behoben ist.

5. **Merge:** `git checkout main && git merge --no-ff <branch> -m "..."`, danach Feature-Branch löschen (lokal, und falls bereits gepusht auch `git push origin --delete <branch>`), `git push origin main`.

## Wann NICHT anwenden

Während der eigentlichen Implementierung — dieser Skill ist der letzte Schritt vor dem Merge, kein Ersatz für iteratives Arbeiten währenddessen.
