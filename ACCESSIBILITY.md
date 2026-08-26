# Accessibility-Audit

Übersicht der über `@storybook/addon-a11y` (axe-core) gefundenen Verstöße, chronologisch. Geprüft: alle sechs Button-Varianten (Primary, Outline, Secondary, Ghost, Destructive, Link), Größe `default`.

## Automatisiertes Gate (seit 2026-08-26)

`npm run test:a11y` (`scripts/check-accessibility.mjs`) baut Storybook statisch, serviert es, und prüft jede Story per Playwright + `@axe-core/playwright` — läuft automatisch in CI (`.github/workflows/accessibility.yml`) bei jedem Push/PR. Modelliert nach GitHub Primers echtem `aat-reports.yml` (Playwright direkt gegen eine gebaute Storybook-Instanz), **nicht** über `@storybook/addon-vitest` (kaputt, siehe Playbook Step 6 — Rolldown/aria-query-Bug).

Zwei Stolperfallen beim Bau des Skripts, beide primärquellenbasiert gefunden, nicht geraten:
- `serve`s Default-"Clean URLs" leitet `/iframe.html?id=...` auf `/iframe` um und wirft dabei die Story-ID weg — per `serve.json` (`cleanUrls: false`) deaktiviert.
- `networkidle` allein ist kein verlässliches "Story fertig gerendert"-Signal — `#storybook-root` bleibt bis dahin `hidden` und leer. Fix: explizit auf befüllten, sichtbaren Root warten.
- Zwei zusätzliche axe-Regeln deaktiviert (`landmark-one-main`, `page-has-heading-one`) — Seitenstruktur-Regeln, die für eine isolierte Komponente strukturell nie erfüllbar sind, dieselbe Logik wie Storybooks eigener `region`-Ausschluss.

**Bekannter Zustand:** CI zeigt aktuell **rot** — der offene Destructive-Kontrast-Fund unten ist ein echter, noch nicht behobener Verstoß, keine Fehlkonfiguration des Gates.

**Wichtiger Kontext-Hinweis:** Dieses Dokument entstand in einem Solo-Lernprojekt — Farbanpassungen wurden hier direkt vorgenommen. **In einem echten Team-/Kundenprojekt gehört eine Kontrast-Korrektur nicht in eine stille Code-Änderung**, sondern zurück an den Brand-/Design-Owner oder die für Barrierefreiheit verantwortliche Stelle (CI-Verantwortlicher, Kunde) — eine Markenfarbe zu verändern ist eine Entscheidung, die über reine Technik hinausgeht.

## 2026-08-26 — Primary-Button: Farbkontrast

- **Fund:** `color.background.primary.default` (`colors.blue.500`, `#3b82f6`) mit weißem Text ergab ein Kontrastverhältnis von 3,67:1 — WCAG AA verlangt bei 14px normal 4,5:1.
- **Fix:** `color.background.primary.default` referenziert jetzt `colors.blue.600` (`#2563eb`, bereits als Primitive vorhanden, vorher nur für den Hover-Zustand genutzt) — Kontrastverhältnis jetzt 5,17:1. Kein neuer, erfundener Farbwert — Wiederverwendung eines bestehenden, bereits geprüften Tokens.
- **Nebeneffekt behoben (2026-08-26, Nachtrag):** `color.background.primary.hover` referenzierte danach ebenfalls `colors.blue.600` — Default und Hover waren kurzzeitig farblich identisch. Fix: neue Primitive `colors.blue.700` (`#1d4ed8`, Tailwinds offizieller Wert — dieselbe Quelle wie 500/600, kein erfundener Ton) für Hover, Kontrast gegen Weiß 6,7:1.
- **Verifiziert:** live über `@storybook/addon-a11y`, Primary-Story: 0 Violations, 6 Passes (vorher: 1 Violation).

## 2026-08-26 — Destructive-Button: Farbkontrast (offen, nicht behoben)

- **Fund:** `variant="destructive"` nutzt ausschließlich shadcns eigene `--destructive`-Variable (`oklch(0.577 0.245 27.325)`, kompiliert zu `#e7000b` auf `#fde6e7`-Hintergrund) — **kein eigenes Token in `tokens.json`**, siehe `button.meta.json`. Kontrastverhältnis 4,0:1, WCAG AA verlangt 4,5:1.
- **Bewusst nicht gefixt:** Anders als beim Primary-Button gibt es hier keinen bereits vorhandenen, geprüften Alternativ-Wert in unserem eigenen Token-System — ein Fix würde entweder shadcns eigenen Default-Wert ändern (nicht unser Wert, keine eigene Quelle dafür) oder ein neues, eigenes `color.background.destructive`-Token anlegen (von Step 3 bewusst offengelassen). Beides eine echte Design-Entscheidung, kein reiner Bugfix.

## Offene Folgefragen

- Destructive-Kontrast: eigenes Token anlegen oder shadcn-Wert direkt anpassen?
