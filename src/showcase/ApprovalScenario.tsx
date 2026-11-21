import { useEffect, useRef, useState } from "react"
import { CheckCircle2, Undo2 } from "lucide-react"
import { ApprovalDetails, ApprovalGate } from "@/components/ax/ApprovalGate"
import { SourceAttributionBadge, type AgentSource } from "@/components/ax/SourceAttributionBadge"
import { Button } from "@/components/ui/button"
import { commitChanges, stageChanges, stageRollback, type Stage } from "@/lib/governance/fmea-guardrails"
import { reviewPrimaryAction } from "@/lib/governance/primary-action-review"
import reviewPolicySource from "@/lib/governance/primary-action-review.ts?raw"
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
      <div inert aria-hidden="true" className="my-3 inline-grid max-w-full grid-cols-2 gap-2 sm:my-6">
        <Button variant="outline" size="sm">
          {actions.find(action => action.id !== primary)?.label}
        </Button>
        <Button variant="primary" size="sm">
          {labelFor(primary)}
        </Button>
      </div>
      <p className="text-sm text-muted-foreground">Hauptaktion · <strong className="text-foreground">{labelFor(primary)}</strong></p>
    </section>
  )
}

type Outcome = "proposed" | "discarded" | "applied" | "restored"
type Applied = { stage: Stage; timestamp: string }

export default function ApprovalScenario({ active }: { active: boolean }) {
  const [surface, setSurface] = useState(initialButtonSurface)
  const [store] = useState(() => createWorkbenchStore(surface, setSurface))
  const [outcome, setOutcome] = useState<Outcome>("proposed")
  const [review, setReview] = useState<{ stage: Stage; before: string; after: string }>()
  const stage = review?.stage
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

  const [attempt, setAttempt] = useState(0)
  useEffect(() => {
    if (!active || outcome !== "proposed") return
    let current = true
    const proposed = workbenchProposal(surface, false)
    const result = reviewPrimaryAction(surface, proposed)
    if (result.kind === "review") {
      stageChanges(surface, proposed, workbenchPolicy).then(
        prepared => {
          if (current) {
            setReview({ stage: prepared, before: result.before, after: result.after })
            setError("")
          }
        },
        () => { if (current) setError("Der Vorschlag konnte nicht vorbereitet werden.") },
      )
    }
    return () => { current = false }
  }, [active, outcome, surface, attempt])

  function apply(approved: Stage, digest: string) {
    if (!transfer || stage?.digest !== digest) return
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
      <p className="mb-6 max-w-2xl text-sm text-muted-foreground">Im Beitragseditor stehen zwei Aktionen zur Wahl. Der hervorgehobene Button zeigt der Redaktion den empfohlenen nächsten Schritt.</p>
      {comparison || <ActionPreview title="Aktueller Stand" primary={primary} />}
      <div className="mt-6 space-y-3">
        {transfer && <>
          <p className="flex items-center gap-2 text-sm"><CheckCircle2 aria-hidden="true" className="size-4" /> Designregeln erfüllt</p>
          <h3 className="font-semibold">Warum ist deine Freigabe gefragt?</h3>
          <p className="max-w-2xl text-sm">Heute legt der Editor nahe, den Beitrag zu veröffentlichen. Der Agent möchte der Redaktion empfehlen, ihn zunächst als Entwurf zu speichern. Beide Varianten erfüllen die Designregeln. Du entscheidest, welche Empfehlung zum redaktionellen Ablauf passt.</p>
          {active && stage && stage.version === surface.version && !busy && <ApprovalGate stage={stage} impactSummary={impact}
            inlineActionLabel={`„${labelFor(transfer.after)}“ als Hauptaktion übernehmen`}
            rollbackSummary={`Auch nach der Übernahme kannst du „${labelFor(transfer.before)}“ als Hauptaktion wiederherstellen.`}
            onReject={() => setOutcome("discarded")} onCommit={apply} />}
          {error && <Button variant="outline" onClick={() => setAttempt(value => value + 1)}>Erneut prüfen</Button>}
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
          <Button variant="outline" onClick={() => { setReview(undefined); setOutcome("proposed") }}><Undo2 aria-hidden="true" /> Vorschlag erneut ansehen</Button>}
        {error && <p role="alert">{error}</p>}
        {review && <>
          <ApprovalDetails proposal={review.stage} />
          <details className="text-sm text-muted-foreground">
            <summary className="cursor-pointer">Welche Regel greift hier?</summary>
            <figure className="mt-3 max-w-3xl">
              <figcaption className="mb-2">Nach bestandener Designprüfung vergleicht die Regel die Button-IDs. Der Wechsel von <code>{review.before}</code> zu <code>{review.after}</code> macht die menschliche Freigabe erforderlich.</figcaption>
              <pre aria-label="TypeScript-Code der Freigaberegel" tabIndex={0}
                className="overflow-x-auto rounded-lg border border-border bg-muted p-4 text-xs leading-relaxed text-foreground focus-visible:outline-ring"><code>{reviewPolicySource.slice(reviewPolicySource.indexOf("export function ")).trimEnd()}</code></pre>
            </figure>
          </details>
        </>}
      </div>
      <details className="mt-6 border-t border-border pt-4 text-sm">
        <summary className="cursor-pointer font-medium">Wo wäre eine Freigabe im Produktalltag sinnvoll?</summary>
        <dl className="mt-4 max-w-2xl space-y-4">
          <div>
            <dt className="font-semibold">Datensätze löschen</dt>
            <dd className="mt-1">Der Agent möchte „Archivieren“ durch „Endgültig löschen“ ersetzen. Vor der Freigabe müsste der Dialog zeigen, welche Datensätze der neue Befehl löscht und ob sie sich wiederherstellen lassen.</dd>
          </div>
          <div>
            <dt className="font-semibold">Formulardaten schützen</dt>
            <dd className="mt-1">Der Agent möchte ein Passwort bei der Eingabe im Klartext anzeigen. Im Dialog müsste stehen, wer es dann auf dem Bildschirm mitlesen kann. Auch ein neues Feld für sensible Angaben oder der Wegfall eines Pflichtfelds wären Gründe zur Prüfung.</dd>
          </div>
          <div>
            <dt className="font-semibold">Tarife vorauswählen</dt>
            <dd className="mt-1">Der Agent schlägt vor, im Checkout den Jahrestarif vorauszuwählen. Vor der Entscheidung sollte das Team sehen, welchen Betrag Kundinnen und Kunden sofort zahlen und wie lange sie sich binden.</dd>
          </div>
          <div>
            <dt className="font-semibold">Zugriffsrechte erweitern</dt>
            <dd className="mt-1">Neue Teammitglieder sollen automatisch Adminrechte erhalten. Der Dialog müsste zeigen, welche zusätzlichen Rechte das gewährt. Die Freigabe läge bei einer Person, die diese Rechte vergeben darf.</dd>
          </div>
        </dl>
      </details>
    </section>
  )
}
