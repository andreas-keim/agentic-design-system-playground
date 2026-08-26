import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { EditEntryPanel } from '@/components/edit-entry-panel'

function App() {
  const [entry, setEntry] = useState('Wocheneinkauf: Milch, Eier, Brot')
  const [deleted, setDeleted] = useState(false)

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background">
      <Button>Primary Button</Button>
      <Button disabled>Disabled Button</Button>

      {deleted ? (
        <p className="text-sm text-muted-foreground">Eintrag gelöscht.</p>
      ) : (
        <EditEntryPanel
          value={entry}
          onSave={(next) => setEntry(next)}
          onCancel={() => setEntry(entry)}
          onDelete={() => setDeleted(true)}
        />
      )}
    </div>
  )
}

export default App
