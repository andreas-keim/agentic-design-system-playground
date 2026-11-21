import { useRef, useState } from "react"
import { CheckCircle2, Undo2 } from "lucide-react"
import { ApprovalGate } from "@/components/ax/ApprovalGate"
import { SourceAttributionBadge, type AgentSource } from "@/components/ax/SourceAttributionBadge"
import { Button, buttonVariants } from "@/components/ui/button"
import { commitChanges, stageChanges, stageRollback, type Stage } from "@/lib/governance/fmea-guardrails"
import { reviewPrimaryAction } from "@/lib/governance/primary-action-review"
import { createWorkbenchStore, initialButtonSurface, workbenchProposal } from "@/lib/governance/workbench-surface"
import { workbenchPolicy } from "@/lib/governance/workbench-policy"

const actions = [
  { id: "publish", label: "Veröffentlichen" },
  { id: "save-draft", label: "Entwurf speichern" },
]
const labelFor = (id: string) => actions.find(action => action.id === id)?.label ?? id

function ActionPreview({ title, primary }: { title: string; primary: string }) {
  return (
    <section className="min-w-0 rounded-xl border border-border bg-background p-4 sm:p-6">
      <h3 className="text-sm font-semibold">{title}</h3>
      <div aria-hidden="true" className="my-3 sm:my-6 flex flex-wrap gap-2">
        {actions.map(action => (
          <span key={action.id} className={buttonVariants({ variant: primary === action.id ? "primary" : "outline", size: "sm" })}>
            {action.label}
          </span>
        ))}
      </div>
      <p className="text-sm text-muted-foreground">Hauptaktion · <strong className="text-foreground">{labelFor(primary)}</strong></p>
    </section>
  )
}

type Outcome = "proposed" | "discarded" | "applied" | "restored"
type Applied = { stage: Stage; timestamp: string }

export default function ApprovalScenario() {
  const [surface, setSurface] = useState(initialButtonSurface)
  const [store] = useState(() => createWorkbenchStore(surface, setSurface))
  const [outcome, setOutcome] = useState<Outcome>("proposed")
  const [stage, setStage] = useState<Stage>()
  const [applied, setApplied] = useState<Applied>()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  const locked = useRef(false)
  const edits = workbenchProposal(surface, false)
  const decision = reviewPrimaryAction(surface, edits)
  const primary = surface.components.find(node => node.props.variant === "primary")!.id
  const showProposal = outcome === "proposed"
  const transfer = showProposal && decision.kind === "review" ? decision : undefined
  const impact = transfer
    ? `Die Hauptaktion wechselt von „${labelFor(transfer.before)}“ zu „${labelFor(transfer.after)}“.`
    : ""

  async function run(operation: () => Promise<void>) {
    if (locked.current) return
    locked.current = true
    setBusy(true)
    setError("")
    try {
      await operation()
    } catch {
      setError("Der Vorschlag konnte nicht übernommen oder vorbereitet werden. Bitte prüfe den aktuellen Stand erneut.")
    } finally {
      locked.current = false
      setBusy(false)
    }
  }

  function openReview() {
    if (!transfer) return
    void run(async () => setStage(await stageChanges(surface, edits, workbenchPolicy)))
  }

  function apply(approved: Stage, digest: string) {
    if (!transfer || stage?.digest !== digest) return
    setStage(undefined)
    void run(async () => {
      await commitChanges(store, approved, digest, workbenchPolicy)
      setApplied({ stage: approved, timestamp: new Date().toISOString() })
      setOutcome("applied")
    })
  }

  const restore: AgentSource["onRollback"] = async digest => {
    if (!applied || applied.stage.digest !== digest) throw new Error("Die Änderung ist nicht mehr aktuell.")
    const inverse = await stageRollback(surface, applied.stage, workbenchPolicy)
    await commitChanges(store, inverse, inverse.digest, workbenchPolicy)
    setOutcome("restored")
    setApplied(undefined)
    return { kind: "manual", digest: inverse.digest, timestamp: new Date().toISOString() }
  }

  const comparison = transfer && (
    <div className="grid gap-3 md:grid-cols-2">
      <ActionPreview title="Aktuell" primary={transfer.before} />
      <ActionPreview title="Agentenvorschlag" primary={transfer.after} />
    </div>
  )

  return (
    <section className="rounded-2xl border border-border bg-card p-4 shadow-xs sm:p-8">
      <h2 className="mb-2 text-xl font-semibold">Soll „Entwurf speichern“ die Hauptaktion werden?</h2>
      <p className="mb-6 max-w-2xl text-sm text-muted-foreground">Der Agent schlägt eine Änderung an den Buttons im Beitragseditor vor.</p>
      {comparison || <ActionPreview title="Aktueller Stand" primary={primary} />}
      <div className="mt-6 space-y-3">
        {transfer && <>
          <p className="flex items-center gap-2 text-sm"><CheckCircle2 aria-hidden="true" className="size-4" /> Designregeln erfüllt · Freigabe ausstehend</p>
          <h3 className="font-semibold">Warum ist deine Freigabe gefragt?</h3>
          <p className="max-w-2xl text-sm">{impact} Damit legt die Oberfläche einen anderen nächsten Schritt nahe. In diesem Workflow entscheidest du, welche Aktion Vorrang hat.</p>
          <div className="flex flex-wrap gap-2">
            <Button onClick={openReview} disabled={busy}>Änderung prüfen</Button>
            <Button variant="ghost" disabled={busy} onClick={() => { setError(""); setOutcome("discarded") }}>Vorschlag verwerfen</Button>
          </div>
          <details className="text-sm text-muted-foreground">
            <summary className="cursor-pointer">Zugrunde liegende Regeln</summary>
            <p className="mt-2 max-w-2xl">Der Token für Hauptaktionen erlaubt die Hervorhebung. Die Komponentenprüfung lässt höchstens eine Hauptaktion zu. Die Beispielregel dieses Workflows vergleicht, welcher Button diese Rolle vor und nach der Änderung hat.</p>
          </details>
        </>}
        {showProposal && decision.kind === "blocked" && <p role="alert">Vorschlag blockiert. Die Designregeln sind verletzt.</p>}
        {showProposal && decision.kind === "no-transfer" && <p>Die Hauptaktion bleibt gleich. Die Freigaberegel greift hier nicht.</p>}
        <div role="status" className="text-sm">
          {outcome === "discarded" && "Vorschlag verworfen. Die bisherige Hauptaktion bleibt bestehen."}
          {outcome === "applied" && "Änderung übernommen und von dir freigegeben."}
          {outcome === "restored" && "Vorherige Hauptaktion wiederhergestellt."}
        </div>
        {applied && <SourceAttributionBadge source={{
          kind: "agent", model: "Showcase", version: "1", label: "Vom Agenten vorgeschlagen",
          rollbackLabel: "Vorherige Hauptaktion wiederherstellen", digest: applied.stage.digest,
          timestamp: applied.timestamp, onRollback: restore,
        }} />}
        {(outcome === "discarded" || outcome === "restored") &&
          <Button variant="outline" onClick={() => setOutcome("proposed")}><Undo2 aria-hidden="true" /> Vorschlag erneut ansehen</Button>}
        {error && <p role="alert">{error}</p>}
      </div>
      {stage && transfer && <ApprovalGate stage={stage} impactSummary={impact} reviewContent={comparison}
        onReject={() => { setStage(undefined); setOutcome("discarded") }} onCommit={apply} />}
    </section>
  )
}
