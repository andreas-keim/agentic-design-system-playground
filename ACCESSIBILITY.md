# Accessibility-Audit

Übersicht der über `@storybook/addon-a11y` (axe-core) gefundenen Verstöße, chronologisch. Geprüft: alle sechs Button-Varianten (Primary, Outline, Secondary, Ghost, Destructive, Link), Größe `default`.

## Automatisiertes Gate (seit 2026-08-26)

`npm run test:a11y` (`scripts/check-accessibility.mjs`) baut Storybook statisch, serviert es, und prüft jede Story per Playwright + `@axe-core/playwright` — läuft automatisch in CI (`.github/workflows/accessibility.yml`) bei jedem Push/PR. Modelliert nach GitHub Primers echtem `aat-reports.yml` (Playwright direkt gegen eine gebaute Storybook-Instanz), **nicht** über `@storybook/addon-vitest` (kaputt, siehe Playbook Step 6 — Rolldown/aria-query-Bug).

Zwei Stolperfallen beim Bau des Skripts, beide primärquellenbasiert gefunden, nicht geraten:
- `serve`s Default-"Clean URLs" leitet `/iframe.html?id=...` auf `/iframe` um und wirft dabei die Story-ID weg — per `serve.json` (`cleanUrls: false`) deaktiviert.
- `networkidle` allein ist kein verlässliches "Story fertig gerendert"-Signal — `#storybook-root` bleibt bis dahin `hidden` und leer. Fix: explizit auf befüllten, sichtbaren Root warten.
- Zwei zusätzliche axe-Regeln deaktiviert (`landmark-one-main`, `page-has-heading-one`) — Seitenstruktur-Regeln, die für eine isolierte Komponente strukturell nie erfüllbar sind, dieselbe Logik wie Storybooks eigener `region`-Ausschluss.

**Bekannter Zustand (2026-08-26, Nachtrag):** CI ist wieder **grün** — der Destructive-Kontrast-Fund unten ist behoben, `npm run test:a11y` zeigt 0 Violations über alle 7 Storys.

## Entscheidung: Issue-Automatisierung statt Agent-Auto-Fix (2026-08-26)

Bei einem Fehlschlag legt der Workflow automatisch ein GitHub Issue an (Label `a11y-violation`) bzw. kommentiert ein bestehendes offenes Issue nach — reines Scripting über den eingebauten, kostenlosen `GITHUB_TOKEN`, kein LLM-Aufruf.

**Bewusst nicht umgesetzt:** ein Agent, der bei einem Fehlschlag automatisch live aufgerufen wird, selbst einen Fix-Commit schreibt und einen PR öffnet. Das wäre technisch die konsequente Fortsetzung von Stufe 1 (automatisches Erkennen) zu "automatisch fixen mit Freigabe" gewesen — bewusst dagegen entschieden, aus zwei Gründen:
1. **Kosten:** ein echter Agent-Aufruf braucht einen API-Key und verursacht bei jedem Fehlschlag echte Kosten — explizit nicht gewollt für dieses Lernprojekt.
2. **Sicherheitsfläche:** ein Agent mit Schreibrechten, der automatisiert PRs öffnet, ist eine andere Kategorie als alles bisher in diesem Solo-Repo Gebaute.

Die Issue-Variante bildet trotzdem den vollständigen Loop ab — erkennen → melden → (manuell oder durch eine bewusst gestartete Claude-Code-Session) fixen → freigeben —, nur dass der letzte Schritt bewusst außerhalb der automatisierten Pipeline bleibt. Deckt sich mit dem, was auch bei Primer real gefunden wurde: selbst deren "Safe Outputs"-Mechanismus braucht einen manuellen Freigabe-/Auslöseschritt, kein System im gesamten Vergleich fixt sich vollautomatisch selbst.

**Wichtiger Kontext-Hinweis:** Dieses Dokument entstand in einem Solo-Lernprojekt — Farbanpassungen wurden hier direkt vorgenommen. **In einem echten Team-/Kundenprojekt gehört eine Kontrast-Korrektur nicht in eine stille Code-Änderung**, sondern zurück an den Brand-/Design-Owner oder die für Barrierefreiheit verantwortliche Stelle (CI-Verantwortlicher, Kunde) — eine Markenfarbe zu verändern ist eine Entscheidung, die über reine Technik hinausgeht.

## 2026-08-26 — Primary-Button: Farbkontrast

- **Fund:** `color.background.primary.default` (`colors.blue.500`, `#3b82f6`) mit weißem Text ergab ein Kontrastverhältnis von 3,67:1 — WCAG AA verlangt bei 14px normal 4,5:1.
- **Fix:** `color.background.primary.default` referenziert jetzt `colors.blue.600` (`#2563eb`, bereits als Primitive vorhanden, vorher nur für den Hover-Zustand genutzt) — Kontrastverhältnis jetzt 5,17:1. Kein neuer, erfundener Farbwert — Wiederverwendung eines bestehenden, bereits geprüften Tokens.
- **Nebeneffekt behoben (2026-08-26, Nachtrag):** `color.background.primary.hover` referenzierte danach ebenfalls `colors.blue.600` — Default und Hover waren kurzzeitig farblich identisch. Fix: neue Primitive `colors.blue.700` (`#1d4ed8`, Tailwinds offizieller Wert — dieselbe Quelle wie 500/600, kein erfundener Ton) für Hover, Kontrast gegen Weiß 6,7:1.
- **Verifiziert:** live über `@storybook/addon-a11y`, Primary-Story: 0 Violations, 6 Passes (vorher: 1 Violation).

## 2026-08-26 — Destructive-Button: Farbkontrast

- **Fund:** `variant="destructive"` nutzt ausschließlich shadcns eigene `--destructive`-Variable (`oklch(0.577 0.245 27.325)`, kompiliert zu `#e7000b` auf `#fde5e7`-Hintergrund) — **kein eigenes Token in `tokens.json`**, siehe `button.meta.json`. Automatisiert per `npm run test:a11y` gemessen: Kontrastverhältnis 3,98:1, WCAG AA verlangt 4,5:1.
- **Ursprünglich bewusst nicht gefixt:** Anders als beim Primary-Button gab es hier keinen bereits vorhandenen, geprüften Alternativ-Wert in unserem eigenen Token-System — ein Fix würde entweder shadcns eigenen Default-Wert ändern (nicht unser Wert, keine eigene Quelle dafür) oder ein neues, eigenes Token anlegen. Beides eine echte Design-Entscheidung, kein reiner Bugfix.
- **Entscheidung (2026-08-26):** eigenes Token angelegt, nicht shadcns `--destructive` global geändert — Begründung: `--destructive` treibt auch Ränder/Ringe an anderen Stellen (`aria-invalid:border-destructive`, Fokus-Ringe), die eine andere Kontrastanforderung haben (3:1 statt 4,5:1 für Text); eine globale Änderung hätte mehr als das eigentliche Problem angefasst und wäre zudem am getönten Hintergrund gescheitert, der proportional mitgewandert wäre.
- **Fix:** neue Primitive `colors.red.700` (`#b91c1c`, Tailwinds offizieller v3-Wert, dieselbe Namenskonvention wie `colors.blue.*`) → neues Semantic-Token `color.text.destructive.default`, nur für die Textfarbe der Destructive-Button-Variante gebunden (`text-[var(--color-text-destructive-default)]`), Hintergrund unverändert. Kontrastverhältnis jetzt 5,4:1 gegen den getönten Hintergrund — live verifiziert (`getComputedStyle` im Browser: `rgb(185, 28, 28)`).
- **Dark Mode bewusst unverändert** (`dark:text-destructive` explizit erhalten): Dieses Token-System hat noch keinen Dark-Mode-Support (siehe Step 1), Primary wurde aus demselben Grund nur für Light Mode korrigiert. Kein Dark-Mode-Audit vorhanden, also auch keine Aussage über dessen Kontrast.
- **Figma noch nicht nachsynchronisiert** — bräuchte einen manuellen Figma-Sync-Lauf (Safe-Mode-Plugin muss laufen), analog zum offen vorgemerkten `blue.500`→`blue.600`-Sync-Rückstand aus Step 6.
- **Verifiziert:** `npm run test:a11y` — 0 Violations über alle 7 Storys (vorher: 1 Violation bei Destructive).

## Offene Folgefragen

- Figma-Sync für den Destructive-Text-Fix nachziehen (Safe-Mode-Plugin-Lauf).
