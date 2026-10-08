# Übung 2: Acht Sätze einteilen

Die Sätze stammen aus den echten Guidelines im Playground. Ordne jedem genau eine Kategorie zu und begründe in einem Halbsatz.

**Kategorien**

- **S** = Schema: lässt sich als erlaubte Props oder Werte im Katalog ausdrücken (`catalog.api.ts`)
- **I** = Implementierung: steckt in der React Komponente des Katalogs (`catalog.tsx`), der Agent muss es nicht wissen
- **R** = Eigene Regel: braucht Code, der über die ganze Seite schaut (`design-rules.ts`)
- **N** = Nicht prüfbar: hängt an Bedeutung und braucht einen Menschen

| Nr | Satz aus den Guidelines | Quelle | Kategorie | Begründung |
|---|---|---|---|---|
| 1 | "Nicht mehr als eine `primary` Instanz gleichzeitig sichtbar." | button | | |
| 2 | "`destructive`: ausschließlich für zerstörerische Aktionen. Nicht für 'Abbrechen'." | button | | |
| 3 | "Es gibt keine Varianten (kein `variant` Prop wie bei Button)." | input | | |
| 4 | "Kein separates `invalid` Prop: die Anwesenheit von `error` ist die einzige Quelle der Wahrheit." | form-field | | |
| 5 | "Nicht die Tailwind Defaultgröße (`h-8`) wieder einführen." | input | | |
| 6 | "`label`: Pflicht. Text des `<label>`, per `htmlFor` mit dem Input verknüpft." | form-field | | |
| 7 | "Bei `variant="link"` immer `h-auto p-0` setzen." | button | | |
| 8 | "FormField setzt `aria-invalid` und `aria-describedby` intern, der Aufrufer baut keine eigene Logik." | form-field | | |

## Danach

Zähl: Wie viele Sätze sind in welcher Kategorie? Welche Kategorie hat dich überrascht, weil du sie nicht erwartet hast?
