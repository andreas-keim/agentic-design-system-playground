import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { EditEntryPanel } from '@/components/edit-entry-panel'

function App() {
  const [entry, setEntry] = useState<string | null>('Wocheneinkauf: Milch, Brot, Kaffee')

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-[var(--space-component-md)] bg-background">
      <div className="flex gap-4">
        <Button>Primary Button</Button>
        <Button disabled>Disabled Button</Button>
      </div>

      {entry === null ? (
        <p className="text-[length:var(--font-size-md)] text-muted-foreground">
          Eintrag gelöscht.
        </p>
      ) : (
        <EditEntryPanel
          value={entry}
          onSave={(next) => setEntry(next)}
          onCancel={() => {}}
          onDelete={() => setEntry(null)}
          className="w-full max-w-md"
        />
      )}
    </div>
  )
}

export default App
