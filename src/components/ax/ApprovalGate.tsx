import { Dialog } from "@base-ui/react/dialog"
import { ShieldCheck } from "lucide-react"
import { useLayoutEffect, useRef, useState } from "react"
import type { Stage } from "@/lib/governance/fmea-guardrails"
import { Button } from "../ui/button"

export interface ApprovalGateProps {
  stage: Stage
  inlineActionLabel?: string
  reviewContent?: React.ReactNode
  rollbackSummary?: string
  impactSummary: string
  allowUndo?: boolean
  onReject: () => void
  /** Dispatch through commitChanges with this exact proposal and digest. */
  onCommit: (stage: Stage, approvedDigest: string) => void
}

export function ApprovalGate(props: ApprovalGateProps) {
  return <Review key={props.stage.digest} {...props} />
}

function Review({ stage, impactSummary, inlineActionLabel, reviewContent, rollbackSummary, allowUndo = true, onReject, onCommit }: ApprovalGateProps) {
  const [proposal] = useState(() => structuredClone(stage))
  const [open, setOpen] = useState(true)
  const [seconds, setSeconds] = useState<number | null>(null)
  const cancelButton = useRef<HTMLButtonElement>(null)
  const deadlineTimer = useRef<number | undefined>(undefined)
  const displayTimer = useRef<number | undefined>(undefined)
  const decided = useRef(false)
  const count = new Set(proposal.edits.map(edit => edit.componentId)).size

  function clearTimers() {
    window.clearTimeout(deadlineTimer.current)
    window.clearInterval(displayTimer.current)
  }
  useLayoutEffect(() => clearTimers, [])

  function reject() {
    if (decided.current) return
    decided.current = true
    clearTimers()
    setOpen(false)
    onReject()
  }

  function commit() {
    if (decided.current) return
    decided.current = true
    clearTimers()
    setOpen(false)
    onCommit(proposal, proposal.digest)
  }

  function approve() {
    if (decided.current || deadlineTimer.current !== undefined) return
    if (!allowUndo) return commit()
    const deadline = Date.now() + 5000
    setSeconds(5)
    cancelButton.current?.focus()
    displayTimer.current = window.setInterval(() => {
      setSeconds(Math.max(0, Math.ceil((deadline - Date.now()) / 1000)))
    }, 1000)
    deadlineTimer.current = window.setTimeout(commit, 5000)
  }

  if (inlineActionLabel) {
    return (
      <div className="space-y-3" onKeyDown={event => {
        if (event.key === "Escape" && seconds !== null) reject()
      }}>
        <p role="status" aria-atomic="true" className="text-sm">
          {seconds === null ? "Nach der Freigabe bleiben fünf Sekunden zum Widerruf."
            : `Übernahme in ${seconds} ${seconds === 1 ? "Sekunde" : "Sekunden"}.`}
        </p>
        <div className="flex flex-wrap gap-2">
          {seconds === null && <Button onClick={approve} className="max-w-full whitespace-normal">{inlineActionLabel}</Button>}
          <Button ref={cancelButton} variant={seconds === null ? "ghost" : "outline"} onClick={reject}>
            {seconds === null ? "Vorschlag verwerfen" : "Freigabe zurücknehmen (Esc)"}
          </Button>
        </div>
        {rollbackSummary && <p className="text-sm text-muted-foreground">{rollbackSummary}</p>}
      </div>
    )
  }

  return (
    <Dialog.Root open={open} onOpenChange={next => { if (!next) reject() }} disablePointerDismissal>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-[var(--color-background-base)]/80" />
        <div className="pointer-events-none fixed inset-0 z-50 grid place-items-center p-[var(--space-component-md)]">
          <Dialog.Popup aria-modal="true" initialFocus={cancelButton} lang="de"
            className="pointer-events-auto grid max-h-full w-full max-w-prose gap-[var(--space-component-md)] overflow-y-auto rounded-[var(--radii-md)] border border-border bg-popover p-[var(--space-component-md)] text-popover-foreground">
            <Dialog.Title className="flex items-center gap-[var(--space-component-sm)] font-[var(--font-weight-bold)]">
              <ShieldCheck aria-hidden="true" /> Änderungen prüfen
            </Dialog.Title>
            <Dialog.Description className="break-words">
              {impactSummary}{!reviewContent && <> · {proposal.surfaceId} (Version {proposal.version}) · {count} {count === 1 ? "Datensatz" : "Datensätze"}</>}
            </Dialog.Description>
            {reviewContent ?? <dl className="grid gap-[var(--space-component-md)]">
              {proposal.edits.map(edit => (
                <div key={JSON.stringify([edit.componentId, edit.field])}>
                  <dt className="break-all font-[var(--font-weight-medium)]">{edit.componentId}.{edit.field}</dt>
                  <dd className="grid gap-[var(--space-component-sm)] sm:grid-cols-2">
                    <div>Vorher <del className="block whitespace-pre-wrap break-all">{displayValue(edit.before)}</del></div>
                    <div>Nachher <ins className="block whitespace-pre-wrap break-all">{displayValue(edit.after)}</ins></div>
                  </dd>
                </div>
              ))}
            </dl>}
            {rollbackSummary && <p>{rollbackSummary}</p>}
            <ApprovalDetails proposal={proposal} />
            <p role="status" aria-live="polite" aria-atomic="true">
              {seconds === null
                ? allowUndo && "Nach der Freigabe bleiben fünf Sekunden zum Zurücknehmen."
                : `Übernahme in ${seconds} ${seconds === 1 ? "Sekunde" : "Sekunden"}.`}
            </p>
            <div className="flex flex-wrap gap-[var(--space-component-sm)]">
              <Dialog.Close ref={cancelButton} render={<Button variant="outline" />}>
                {seconds === null ? "Ablehnen" : "Freigabe zurücknehmen"} (Esc)
              </Dialog.Close>
              {seconds === null && <Button onClick={approve}>Änderungen freigeben</Button>}
            </div>
          </Dialog.Popup>
        </div>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

export function ApprovalDetails({ proposal }: { proposal: Stage }) {
  return (
    <details className="text-sm text-muted-foreground">
      <summary className="cursor-pointer">Technische Details zum Vorschlag</summary>
      <p className="mt-2 font-medium text-foreground">Diese Feldwerte werden beim Rückgängigmachen wiederhergestellt</p>
      <ul>
        {proposal.rollback.map(edit => (
          <li key={JSON.stringify([edit.componentId, edit.field])} className="break-all">
            {edit.componentId}.{edit.field} · {displayValue(edit.before)} → {displayValue(edit.after)}
          </li>
        ))}
      </ul>
      <p className="mt-3">Vor der Übernahme prüft das System, ob die Änderung genau dem Vorschlag entspricht, den du freigegeben hast. Dafür vergleicht es die SHA-256-Prüfsummen.</p>
      <p className="mt-1">Prüfsumme dieses Vorschlags <code className="block break-all">{proposal.digest}</code></p>
    </details>
  )
}

function displayValue(value: string | null) {
  return value === null ? "(nicht gesetzt)" : value === "" ? "(leerer Text)" : value
}
