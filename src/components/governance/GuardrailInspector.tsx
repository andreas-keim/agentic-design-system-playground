"use client"

import { useEffect, useState } from "react"
import { Button } from "../ui/button"
import {
  commitChanges, createToolLedger, fmea, stageChanges, stageRollback, verifyChanges,
} from "../../lib/governance/fmea-guardrails"
import type { Receipt, Stage, Surface, SurfaceStore } from "../../lib/governance/fmea-guardrails"
import { workbenchPolicy } from "../../lib/governance/workbench-policy"

import { workbenchProposal } from "../../lib/governance/workbench-surface"

const colors = { green: "bg-emerald-600", yellow: "bg-amber-500", red: "bg-rose-600" }
type Color = keyof typeof colors
type Risk = (typeof fmea)[keyof typeof fmea]

function Guard({ label, status, color, risk }: { label: string; status: string; color: Color; risk: Risk }) {
  return (
    <li className="flex items-start gap-2">
      <span aria-hidden="true" className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${colors[color]}`} />
      <div>
        <strong className="font-medium">{label}</strong> · {status}
        <small className="block text-muted-foreground">
          {risk.id} · Baseline RPZ {risk.severity * risk.occurrence * risk.detection}
          {" "}({risk.severity} × {risk.occurrence} × {risk.detection})
        </small>
      </div>
    </li>
  )
}

function PendingRequest({ receipt }: { receipt: Receipt<Surface> }) {
  const [seconds, setSeconds] = useState(0)
  useEffect(() => {
    const start = Date.parse(receipt.timestamp)
    const timers = [2, 5, 8].map(seconds => setTimeout(
      () => setSeconds(seconds), Math.max(0, start + seconds * 1000 - Date.now()),
    ))
    return () => timers.forEach(clearTimeout)
  }, [receipt])
  if (seconds < 2) return null
  return <p role="status">{seconds >= 8 ? "Outcome pending. Track this request ID before retrying."
    : seconds >= 5 ? "Still waiting. Use the receipt below to track this request."
      : "Request acknowledged. Waiting for the write confirmation."}</p>
}

type Approval = { stage: Stage; requestId: string; undo: boolean }

export function GuardrailInspector({ surface, store }: { surface: Surface; store: SurfaceStore }) {
  const [scenario, setScenario] = useState("case-03")
  const [approval, setApproval] = useState<Approval>()
  const [committed, setCommitted] = useState<Stage>()
  const [receipt, setReceipt] = useState<Receipt<Surface>>()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  const [ledger] = useState(() => createToolLedger<Surface>())
  const edits = workbenchProposal(surface, scenario === "case-03")
  const reviewing = approval?.stage.version === surface.version ? approval : undefined
  const report = verifyChanges(surface, reviewing?.stage.edits ?? edits, workbenchPolicy)
  const fields = report.fields
  const issues = [...new Map([...fields.flatMap(field => field.issues), ...report.surfaceIssues]
    .map(issue => [JSON.stringify(issue), issue])).values()]
  const valid = fields.every(field => field.valid) && issues.length === 0

  async function prepare(undo: boolean) {
    setBusy(true)
    setError("")
    setReceipt(undefined)
    try {
      const stage = undo && committed
        ? await stageRollback(surface, committed, workbenchPolicy)
        : await stageChanges(surface, edits, workbenchPolicy)
      setApproval({ stage, requestId: crypto.randomUUID(), undo })
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : String(failure))
    } finally {
      setBusy(false)
    }
  }

  async function apply() {
    if (!reviewing) return
    setBusy(true)
    setError("")
    try {
      const { stage, requestId, undo } = reviewing
      const ack = ledger.submit(requestId, stage.digest, () => commitChanges(store, stage, stage.digest, workbenchPolicy))
      setReceipt(ack)
      await ack.result
      setCommitted(undo ? undefined : stage)
      setApproval(undefined)
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : String(failure))
    } finally {
      setBusy(false)
    }
  }

  return (
    <section aria-label="Guardrail inspector" className="mt-5 space-y-3 border-t border-border pt-4 text-sm">
      <h4 className="font-semibold">Guardrail inspector</h4>
      <label className="block">
        Button proposal
        <select className="mt-1 block w-full rounded-md border border-border bg-background p-2"
          value={scenario} disabled={busy} onChange={event => {
            setScenario(event.target.value)
            setApproval(undefined)
            setReceipt(undefined)
            setError("")
          }}>
          <option value="case-03">Case 03 · raw color and two primary buttons</option>
          <option value="valid">Swap the primary action</option>
        </select>
      </label>
      <ul aria-live="polite" className="space-y-2">
        <Guard label="Progressive verification" status={valid ? "Verified" : "Blocked"}
          color={valid ? "green" : "red"} risk={fmea.verification} />
        <Guard label={reviewing?.undo ? "Rollback" : "Stage and commit"}
          status={error ? "Failed" : reviewing ? "Awaiting approval" : receipt && !busy ? "Applied" : valid ? "Ready to stage" : "Blocked"}
          color={error || !valid ? "red" : receipt && !busy && !reviewing ? "green" : "yellow"}
          risk={reviewing?.undo ? fmea.rollback : fmea.commit} />
        <Guard label="Tool receipt" status={receipt ? error ? "Check request" : busy ? "Acknowledged" : "Confirmed" : "No request"}
          color={receipt ? error ? "red" : busy ? "yellow" : "green" : "yellow"} risk={fmea.receipt} />
      </ul>
      <details open={reviewing ? true : undefined} className="break-words">
        <summary className="cursor-pointer">Field evidence · version {surface.version}</summary>
        <ul className="mt-2 space-y-2">
          {fields.map(field => (
            <li key={JSON.stringify([field.componentId, field.field])}>
              <code>{field.componentId}.{field.field}</code> · {field.valid ? "Valid" : "Blocked"}
              <div>{field.before ?? "(unset)"} → {field.after ?? "(unset)"}</div>
              <small className="break-all">{field.source}</small>
            </li>
          ))}
        </ul>
      </details>
      {issues.map(issue => <p key={JSON.stringify(issue)}>{issue.reason} {issue.replacement && <strong>{issue.replacement}</strong>}</p>)}
      {reviewing && <div className="space-y-1">
        <p>Rollback preview</p>
        {reviewing.stage.rollback.map(edit => <p key={JSON.stringify([edit.componentId, edit.field])}>
          {edit.componentId}.{edit.field} · {edit.before ?? "(unset)"} → {edit.after ?? "(unset)"}
        </p>)}
        <code className="block break-all text-xs">SHA-256 {reviewing.stage.digest}</code>
      </div>}
      {receipt && busy && <PendingRequest key={receipt.requestId} receipt={receipt} />}
      {receipt && <p className="break-all text-xs" role="status">Request {receipt.requestId} · <time dateTime={receipt.timestamp}>{receipt.timestamp}</time></p>}
      {error && <p role="alert">{error}</p>}
      <div className="flex flex-wrap gap-2">
        {reviewing
          ? <Button variant="outline" disabled={busy || !valid} onClick={apply}>Approve {reviewing.undo ? "rollback" : "commit"}</Button>
          : <Button variant="outline" disabled={!valid || busy} onClick={() => prepare(false)}>Stage changes</Button>}
        {committed?.version === surface.version - 1 && !reviewing &&
          <Button variant="ghost" disabled={busy} onClick={() => prepare(true)}>Review rollback</Button>}
      </div>
    </section>
  )
}
