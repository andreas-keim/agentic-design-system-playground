# Übungsraum: Katalog, Regeln und was sich prüfen lässt

Ziel: Du kannst am Ende erklären, **warum** eine Regel Schema, Implementierung, eigener Code oder gar nicht prüfbar ist, und du hast eine solche Regel selbst geschrieben.

Du arbeitest auf dem Branch `a2ui-uebungen`. Alles ist mit `git restore <datei>` rückgängig zu machen. Der Branch `a2ui-experiment` bleibt unberührt.

## Ablauf, jede Übung gleich

1. **Vorhersagen:** Schreib vorher auf, was passieren wird.
2. **Ändern:** Mach die Änderung selbst.
3. **Ausführen:** Starte den Prüfer.
4. **Vergleichen:** Stimmt deine Vorhersage? Wenn nicht, ist genau das die Lernstelle.

Erst danach schaust du in `loesungen/`.

## Die Übungen

| Datei | Thema | Dauer |
|---|---|---|
| `01-vorhersagen.md` | Drei Änderungen, drei Vorhersagen | ca. 15 Min |
| `02-einteilung.md` | Acht Guideline Sätze einteilen | ca. 15 Min |
| `03-eigene-regel.ts` | Eine Regel selbst schreiben, mit Selbsttest | ca. 30 Min |

## Befehle

```bash
node src/a2ui/check.ts                       # alle 12 Testfälle
node src/a2ui/uebungen/pruefe.ts             # Selbsttest für Übung 3
node src/a2ui/uebungen/pruefe.ts --loesung   # derselbe Test gegen die Musterlösung
git restore src/a2ui                         # alles zurücksetzen
```

## Wo du schaust, wenn du hängst

1. `src/a2ui/README.md` (Ergebnis des Experiments)
2. `src/a2ui/design-rules.ts` (vier fertige Regeln als Vorbild)
3. Frag mich nach einem Hinweis. Die Lösung hebe ich mir für nach deinem Versuch auf.
