# Input — Nutzungsrichtlinien

Input ist ein einzeiliges Textfeld (Base UI `<input>`-Primitive, gestylt). Struktur/Props/Token-Bindung stehen in [`input.meta.json`](./input.meta.json).

## Wann verwenden

Für jede einzeilige Texteingabe (E-Mail, Passwort, Suche, kurzer Freitext). Kein Textarea-Ersatz — für mehrzeiligen Text existiert aktuell keine eigene Komponente.

## Zusammenspiel mit Button

In einem Formular (z. B. Login) haben Input und `Button` (Size `default`) dieselbe Höhe/Zeilenhöhe, weil beide auf `--space-component-sm`/`--space-component-md` für vertikales/horizontales Padding und auf `--font-size-md`/`--font-line-height-md` für Text binden. Nicht die Tailwind-Defaultgröße (`h-8`) wieder einführen — das würde diese Angleichung wieder auseinanderziehen (derselbe Bug wie der ursprüngliche Button-Token-Drift aus Step 2).

## Fehlerzustand

`aria-invalid="true"` setzen, keinen eigenen roten Rand per `className` erzwingen — die Fehlerdarstellung ist bereits über `aria-invalid:*` gebunden (siehe `input.meta.json`).

## Nicht (fälschlich) annehmen

- Es gibt **keine Varianten** (kein `variant`-Prop wie bei Button) — nur einen visuellen Zustand, gesteuert über native HTML-Attribute (`disabled`, `aria-invalid`) statt über Props.
- Kein eigenes Label-Element — ein zugehöriges `<label htmlFor>` muss der Aufrufer selbst setzen, Input erzwingt keine Zuordnung.
