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
  title?: string
  inputLabel?: string
  deleteLabel?: string
  cancelLabel?: string
  saveLabel?: string
}

/**
 * Enterprise Record Configuration Panel:
 * Ein eigenständiges, klares Bauteil (White Card Surface) ohne verschachtelte Sub-Cards.
 */
function EditEntryPanel({
  value,
  onSave,
  onCancel,
  onDelete,
  className,
  title = "System Access & Role Configuration",
  inputLabel = "Record Identifier & Clearance Level",
  deleteLabel = "Delete Record",
  cancelLabel = "Cancel",
  saveLabel = "Save Changes",
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
        "flex flex-col gap-5 rounded-xl border border-border/90 bg-card p-6 text-card-foreground shadow-sm transition-shadow",
        className
      )}
    >
      {title && (
        <div className="flex items-center justify-between border-b border-border/50 pb-3">
          <h4 className="text-xs font-semibold tracking-tight text-foreground">
            {title}
          </h4>
          <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
            Live Record
          </span>
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        {inputLabel && (
          <label className="text-xs font-medium text-foreground">
            {inputLabel}
          </label>
        )}
        <Input
          value={draft}
          onValueChange={(nextValue) => setDraft(nextValue)}
          aria-label={inputLabel}
          className="w-full rounded-lg border border-border/80 bg-muted/20 px-3.5 py-2 text-xs leading-relaxed text-foreground outline-none transition-colors focus-visible:bg-card focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20"
        />
      </div>

      <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <Button
          variant="destructive"
          onClick={onDelete}
          className="text-xs h-8 px-3 w-full sm:w-auto"
        >
          {deleteLabel}
        </Button>
        <div className="flex items-center gap-2 justify-end w-full sm:w-auto">
          <Button
            variant="outline"
            onClick={handleCancel}
            className="text-xs h-8 px-3 flex-1 sm:flex-initial"
          >
            {cancelLabel}
          </Button>
          <Button
            variant="primary"
            onClick={() => onSave(draft)}
            className="text-xs h-8 px-3.5 flex-1 sm:flex-initial"
          >
            {saveLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}

export { EditEntryPanel }
