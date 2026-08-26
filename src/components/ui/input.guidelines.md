# Input — Nutzungsrichtlinien

Input ist ein einzeiliges Textfeld (Base UI `<input>`-Primitive, gestylt). Struktur/Props/Token-Bindung stehen in [`input.meta.json`](./input.meta.json).

## Wann verwenden

Für jede einzeilige Texteingabe (E-Mail, Passwort, Suche, kurzer Freitext). Kein Textarea-Ersatz — für mehrzeiligen Text existiert aktuell keine eigene Komponente.

## Zusammenspiel mit Button

In einem Formular (z. B. Login) haben Input und `Button` (Size `default`) dieselbe Höhe/Zeilenhöhe, weil beide auf `--space-component-sm`/`--space-component-md` für vertikales/horizontales Padding und auf `--font-size-md`/`--font-line-height-md` für Text binden. Nicht die Tailwind-Defaultgröße (`h-8`) wieder einführen — das würde diese Angleichung wieder auseinanderziehen (derselbe Bug wie der ursprüngliche Button-Token-Drift aus Step 2).

## Fehlerzustand

`aria-invalid="true"` setzen, keinen eigenen roten Rand per `className` erzwingen — die Fehlerdarstellung ist bereits über `aria-invalid:*` gebunden (siehe `input.meta.json`).

## Bekannte Lücke: `onValueChange` (gefunden durch einen Agenten-Testlauf, Step 7)

`Input` ist als `React.ComponentProps<"input">` typisiert — das deckt Base UIs eigenes `onValueChange` nicht ab, nur natives `value`/`onChange`. `src/components/edit-entry-panel.tsx` umgeht das bereits, indem es `Input` direkt aus `@base-ui/react/input` importiert statt aus diesem Wrapper — unterläuft den in `input.meta.json` dokumentierten "ein Importpfad"-Zweck. Bis das behoben ist: natives `value`/`onChange` reicht für die allermeisten Fälle (siehe `login-page.tsx`); nur bei echtem Bedarf für Base UIs `onValueChange`-API bewusst den Wrapper umgehen, nicht den Typ mit `as any` erzwingen.

## Nicht (fälschlich) annehmen

- Es gibt **keine Varianten** (kein `variant`-Prop wie bei Button) — nur einen visuellen Zustand, gesteuert über native HTML-Attribute (`disabled`, `aria-invalid`) statt über Props.
- Kein eigenes Label-Element — ein zugehöriges `<label htmlFor>` muss der Aufrufer selbst setzen, Input erzwingt keine Zuordnung.
