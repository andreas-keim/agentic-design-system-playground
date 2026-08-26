import { useState } from "react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface EditEntryPanelProps {
  /** Aktueller Wert des Eintrags, wird als Startwert ins Eingabefeld übernommen. */
  value: string
  /** Wird mit dem bearbeiteten Text aufgerufen, wenn "Speichern" bestätigt wird. */
  onSave: (value: string) => void
  /** Wird aufgerufen, wenn "Abbrechen" die Änderung verwirft. */
  onCancel: () => void
  /** Wird aufgerufen, wenn der Eintrag über "Eintrag endgültig löschen" entfernt wird. */
  onDelete: () => void
  className?: string
}

/**
 * Panel zum Bearbeiten eines einzelnen Text-Eintrags: Eingabefeld plus
 * Speichern/Abbrechen/Löschen-Aktionen. Hält den Entwurf im lokalen State,
 * bis "Speichern" bestätigt oder "Abbrechen" die Änderung verwirft.
 */
function EditEntryPanel({
  value,
  onSave,
  onCancel,
  onDelete,
  className,
}: EditEntryPanelProps) {
  const [draft, setDraft] = useState(value)

  return (
    <div
      data-slot="edit-entry-panel"
      className={cn(
        "flex w-full max-w-sm flex-col gap-[var(--space-component-md)] rounded-lg border border-border bg-card p-[var(--space-component-md)] text-card-foreground",
        className
      )}
    >
      <input
        type="text"
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        aria-label="Eintrag bearbeiten"
        className="w-full rounded-lg border border-input bg-background px-[var(--space-component-md)] py-[var(--space-component-sm)] text-[length:var(--font-size-md)] leading-[var(--font-line-height-md)] text-foreground outline-none transition-all focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
      />
      <div className="flex items-center justify-between gap-[var(--space-component-sm)]">
        <Button type="button" variant="destructive" onClick={onDelete}>
          Eintrag endgültig löschen
        </Button>
        <div className="flex gap-[var(--space-component-sm)]">
          <Button type="button" variant="outline" onClick={onCancel}>
            Abbrechen
          </Button>
          <Button type="button" variant="primary" onClick={() => onSave(draft)}>
            Speichern
          </Button>
        </div>
      </div>
    </div>
  )
}

export { EditEntryPanel }
export type { EditEntryPanelProps }
