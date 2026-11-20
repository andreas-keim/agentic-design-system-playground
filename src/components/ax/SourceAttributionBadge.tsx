import { Popover } from "@base-ui/react/popover"
import { Undo2 } from "lucide-react"
import { useRef, useState } from "react"
import { Button } from "../ui/button"

interface Provenance {
  digest: string
  timestamp: string
}

export interface ManualSource extends Provenance {
  kind: "manual"
}

export interface AgentSource extends Provenance {
  kind: "agent"
  model: string
  version: string
  /** Restore this field and return the provenance of the restored value. */
  onRollback: (approvedDigest: string) => Promise<ManualSource>
}

export function SourceAttributionBadge({ source }: { source: ManualSource | AgentSource }) {
  return <Attribution key={JSON.stringify([source.kind, source.digest, source.timestamp])} source={source} />
}

function Attribution({ source }: { source: ManualSource | AgentSource }) {
  const [restored, setRestored] = useState<ManualSource>()
  const [open, setOpen] = useState(false)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState("")
  const submitted = useRef(false)
  const current = restored ?? source

  async function rollback() {
    if (current.kind !== "agent" || submitted.current) return
    submitted.current = true
    setPending(true)
    setError("")
    try {
      setRestored(await current.onRollback(current.digest))
      setOpen(false)
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "Zurücksetzen fehlgeschlagen.")
      submitted.current = false
    } finally {
      setPending(false)
    }
  }

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger render={<Button size="sm" variant="outline" lang="de" />}>
        <span aria-hidden="true">{current.kind === "manual" ? "👤" : "🤖"}</span>
        {current.kind === "manual" ? "Manuell" : `Agent (${current.model}/${current.version})`}
      </Popover.Trigger>
      <span role="status" aria-live="polite" className="sr-only" lang="de">
        {restored && "Vor-KI-Version wiederhergestellt."}
      </span>
      <Popover.Portal>
        <Popover.Positioner align="start" className="z-50 max-w-[var(--available-width)]">
          <Popover.Popup lang="de" className="grid max-h-[var(--available-height)] max-w-prose gap-[var(--space-component-sm)] overflow-auto rounded-[var(--radii-md)] border border-border bg-popover p-[var(--space-component-md)] text-popover-foreground">
            <Popover.Title className="font-[var(--font-weight-bold)]">Herkunft des Feldwerts</Popover.Title>
            <dl>
              <dt>SHA-256</dt><dd><code className="break-all">{current.digest}</code></dd>
              <dt>Zeitstempel</dt><dd><time dateTime={current.timestamp}>{current.timestamp}</time></dd>
            </dl>
            {current.kind === "agent" && <Button variant="outline" aria-disabled={pending} onClick={rollback}
              className="whitespace-normal">
              <Undo2 aria-hidden="true" /> Auf Vor-KI-Version zurücksetzen
            </Button>}
            {pending && <p role="status">Feld wird zurückgesetzt …</p>}
            {error && <p role="alert">{error}</p>}
            <Popover.Close render={<Button variant="ghost" />}>Schließen</Popover.Close>
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  )
}
