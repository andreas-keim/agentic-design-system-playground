import { useState } from "react"
import { Input } from "@base-ui/react/input"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface EditEntryPanelProps {
  /** Aktueller Wert des Eintrags, wird als Startwert ins Eingabefeld übernommen. */
  value: string
  /** Bestätigt die Änderung mit dem aktuell im Feld stehenden Text. */
  onSave: (value: string) => void
  /** Verwirft die Änderung, das Eingabefeld wird auf `value` zurückgesetzt. */
  onCancel: () => void
  /** Entfernt den Eintrag komplett. Keine Rückgängig-Funktion — siehe Button-Variante `destructive`. */
  onDelete: () => void
  className?: string
}

/**
 * Kleines Panel zum Bearbeiten eines einzelnen Text-Eintrags: ein Eingabefeld
 * plus die drei Aktionen Speichern / Abbrechen / endgültig löschen.
 *
 * Variantenwahl folgt button.guidelines.md: genau eine `primary`-Aktion
 * (Speichern), `outline` für die nicht-destruktive Alternative (Abbrechen),
 * `destructive` ausschließlich für die unwiderrufliche Löschaktion.
 */
function EditEntryPanel({
  value,
  onSave,
  onCancel,
  onDelete,
  className,
}: EditEntryPanelProps) {
  const [draft, setDraft] = useState(value)

  function handleCancel() {
    setDraft(value)
    onCancel()
  }

  return (
    <div
      data-slot="edit-entry-panel"
      className={cn(
        "flex flex-col gap-[var(--space-component-md)] rounded-lg border border-border bg-card p-[var(--space-component-md)] text-card-foreground",
        className
      )}
    >
      <Input
        value={draft}
        onValueChange={(nextValue) => setDraft(nextValue)}
        aria-label="Eintragstext"
        className="w-full rounded-lg border border-border bg-background px-[var(--space-component-md)] py-[var(--space-component-sm)] text-[length:var(--font-size-md)] leading-[var(--font-line-height-md)] text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
      />
      <div className="flex items-center justify-between gap-[var(--space-component-md)]">
        <Button variant="destructive" onClick={onDelete}>
          Eintrag endgültig löschen
        </Button>
        <div className="flex gap-[var(--space-component-sm)]">
          <Button variant="outline" onClick={handleCancel}>
            Abbrechen
          </Button>
          <Button variant="primary" onClick={() => onSave(draft)}>
            Speichern
          </Button>
        </div>
      </div>
    </div>
  )
}

export { EditEntryPanel }
