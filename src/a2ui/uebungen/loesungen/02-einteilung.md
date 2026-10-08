# Lösung zu Übung 2 (erst nach eigenem Versuch lesen)

| Nr | Kategorie | Begründung |
|---|---|---|
| 1 | R | Man muss über die ganze Seite zählen, kein einzelner Baustein sieht den Fehler. Umgesetzt als `max-ein-primary`. |
| 2 | N | Ob eine Aktion zerstörerisch ist, ist Bedeutung. Eine Wortliste ("Cancel", "Abbrechen") wäre fragil und unvollständig. |
| 3 | S | Der Katalog hat für das Feld kein `variant` Prop, `.strict()` lehnt es ab. |
| 4 | S, teils I | Es gibt kein `invalid` Prop, `.strict()` lehnt es ab. Dass der Fehlerzustand aus `error` abgeleitet wird, ist Implementierung. Ein Grenzfall, beide Antworten sind vertretbar. |
| 5 | I | Größen sind Sache der Komponente. Der Agent kann sie gar nicht setzen, weil es `size` im Katalog nicht gibt. Die Regel richtet sich an Entwickler der Komponente. |
| 6 | S | `label` ist im Schema Pflicht, Fall 05 fängt es. |
| 7 | I | Steckt in `catalog.tsx` (`h-auto p-0` bei `link`), der Agent muss es nicht wissen. |
| 8 | I | Macht die FormField Komponente intern, der Aufrufer (Agent) sieht davon nichts. |

**Zählung:** 3 mal S (3, 4, 6), 3 mal I (5, 7, 8), 1 mal R (1), 1 mal N (2).

**Was daran überrascht:** Genauso viele Sätze lassen sich in der Implementierung lösen wie im Schema. Wissen aus Guidelines verschwindet also nicht nur als Regel, sondern oft einfach in der Komponente, die der Agent benutzt. Nur ein Satz von acht ist wirklich nicht prüfbar, und der trägt die Pointe des Posts.

Bei 4 und 5 gibt es keine eindeutige Antwort. Wichtiger als die Kategorie ist, dass du die Entscheidung begründen kannst.
