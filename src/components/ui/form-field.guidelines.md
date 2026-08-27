# FormField — Nutzungsrichtlinien

FormField bündelt Label + `Input` + optionalen Fehlertext zu einem Formularfeld. Struktur/Props stehen in [`form-field.meta.json`](./form-field.meta.json).

## Wann verwenden

Für jedes beschriftete Formularfeld (E-Mail, Passwort, o.ä.). Ersetzt das manuelle Ausrollen von `<label>` + `Input` + Fehler-`<p>`, das `login-page.tsx` und `sign-up-page.tsx` vor Step 7g jeweils unabhängig voneinander taten — Nebenfund aus Step 7 Agent-Test 3: es gab noch kein gemeinsames Form-Field-Pattern, beide Seiten hatten leicht unterschiedliche Label-Klassen und ID-Strategien (feste Strings vs. `useId()`).

## Fehlerzustand

`error` als String-Prop setzen, keine eigene `aria-invalid`/`aria-describedby`-Logik am Aufrufer bauen — FormField übernimmt das intern (gleiche Grundregel wie bei `Input` selbst, siehe `input.guidelines.md`). Kein separates `invalid`-Boolean-Prop: die Anwesenheit von `error` ist die einzige Quelle der Wahrheit, damit nie `aria-invalid=true` ohne sichtbaren Fehlertext (oder umgekehrt) auftreten kann.

## `labelAction`

Für ein Element neben dem Label (z. B. "Forgot password?" als `Button variant="link"`, siehe `login-page.tsx`) — nicht Teil der Fehlerlogik, rein visuelle Positionierung in derselben Zeile wie das Label.

## Nicht (fälschlich) annehmen

- FormField erzwingt **keine** eigene Validierungslogik (kein E-Mail-Format-Check, kein Pflichtfeld-Handling über das native `required` hinaus) — das bleibt beim Aufrufer, genau wie zuvor bei den einzeln ausgerollten Feldern.
- Kein eigenes Figma-Component-Set — bewusste Scope-Entscheidung, siehe `form-field.meta.json`.
- Nicht mit `Input` verwechseln: `Input` bleibt die eigenständige, ungelabelte Primitive für Fälle ohne Label (z. B. reine Inline-Nutzung) — FormField ist die zusammengesetzte Variante für Formulare, kein Ersatz für `Input` an sich.
