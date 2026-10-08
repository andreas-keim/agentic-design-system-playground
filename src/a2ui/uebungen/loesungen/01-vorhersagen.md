# Lösung zu Übung 1 (erst nach eigenem Versuch lesen)

Alle drei Ergebnisse wurden vor dem Schreiben dieser Datei real ausgeführt, nicht angenommen.

**A: `max-ein-primary` entfernt.** Fall 07 wird zur Lücke, danach sind es 10 von 12. Nur dieser eine Fall hing an der Regel. Das Schema hat nie gesehen, dass zwei Buttons `primary` sind, denn jeder einzelne ist gültig.

**B: Label `Geheimwort`.** Fall 09 wird zur Lücke, 10 von 12. `type: "text"` ist für das Schema völlig gültig. Die Ablehnung kam bisher allein von der Regel `passwort-feld-typ`, die im Label nach "password" sucht. Wer das Wort ändert, umgeht sie. Regeln, die auf Wörter achten, prüfen eine Gewohnheit, keine Bedeutung.

**C: `.strict()` entfernt.** Fall 03 wird zur Lücke, 10 von 12. Ohne `.strict()` lässt Zod unbekannte Eigenschaften durch (es entfernt sie standardmäßig), `className` wird also nicht mehr abgelehnt. `.strict()` hat verhindert, dass der Agent etwas setzt, das der Renderer ignoriert, während der Agent glaubt, es wirke.

**Meine Einschätzung zur Schlussfrage (deine darf abweichen):** C ist am gefährlichsten. Bei A und B kippt ein sichtbarer Testfall, bei C scheint alles zu laufen, nur ein ignorierter Stil bleibt unbemerkt, und Fall 03 ist der einzige Fall, der ihn überhaupt abdeckt.
