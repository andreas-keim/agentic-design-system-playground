# Accessibility-Audit

Übersicht der über `@storybook/addon-a11y` (axe-core) gefundenen Verstöße, chronologisch. Geprüft: alle sechs Button-Varianten (Primary, Outline, Secondary, Ghost, Destructive, Link), Größe `default`.

**Wichtiger Kontext-Hinweis:** Dieses Dokument entstand in einem Solo-Lernprojekt — Farbanpassungen wurden hier direkt vorgenommen. **In einem echten Team-/Kundenprojekt gehört eine Kontrast-Korrektur nicht in eine stille Code-Änderung**, sondern zurück an den Brand-/Design-Owner oder die für Barrierefreiheit verantwortliche Stelle (CI-Verantwortlicher, Kunde) — eine Markenfarbe zu verändern ist eine Entscheidung, die über reine Technik hinausgeht.

## 2026-08-26 — Primary-Button: Farbkontrast

- **Fund:** `color.background.primary.default` (`colors.blue.500`, `#3b82f6`) mit weißem Text ergab ein Kontrastverhältnis von 3,67:1 — WCAG AA verlangt bei 14px normal 4,5:1.
- **Fix:** `color.background.primary.default` referenziert jetzt `colors.blue.600` (`#2563eb`, bereits als Primitive vorhanden, vorher nur für den Hover-Zustand genutzt) — Kontrastverhältnis jetzt 5,17:1. Kein neuer, erfundener Farbwert — Wiederverwendung eines bestehenden, bereits geprüften Tokens.
- **Bekannter Nebeneffekt:** `color.background.primary.hover` referenziert ebenfalls `colors.blue.600` — Default und Hover sind dadurch aktuell farblich identisch, der Hover-Zustand hat keine sichtbare Farbänderung mehr. Nicht behoben (würde einen neuen Farbwert für Hover erfordern) — offene Folgefrage, siehe unten.
- **Verifiziert:** live über `@storybook/addon-a11y`, Primary-Story: 0 Violations, 6 Passes (vorher: 1 Violation).

## 2026-08-26 — Destructive-Button: Farbkontrast (offen, nicht behoben)

- **Fund:** `variant="destructive"` nutzt ausschließlich shadcns eigene `--destructive`-Variable (`oklch(0.577 0.245 27.325)`, kompiliert zu `#e7000b` auf `#fde6e7`-Hintergrund) — **kein eigenes Token in `tokens.json`**, siehe `button.meta.json`. Kontrastverhältnis 4,0:1, WCAG AA verlangt 4,5:1.
- **Bewusst nicht gefixt:** Anders als beim Primary-Button gibt es hier keinen bereits vorhandenen, geprüften Alternativ-Wert in unserem eigenen Token-System — ein Fix würde entweder shadcns eigenen Default-Wert ändern (nicht unser Wert, keine eigene Quelle dafür) oder ein neues, eigenes `color.background.destructive`-Token anlegen (von Step 3 bewusst offengelassen). Beides eine echte Design-Entscheidung, kein reiner Bugfix.

## Offene Folgefragen

- Destructive-Kontrast: eigenes Token anlegen oder shadcn-Wert direkt anpassen?
- Primary-Hover: neuer, dritter Blauton nötig (z. B. `colors.blue.700`), um Default und Hover wieder visuell zu unterscheiden?
