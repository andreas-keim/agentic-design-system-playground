import { isPrimaryButton } from "./primary-button"
import { z } from "zod"
import type { Diagnostic } from "./token-validator"

const identifier = z.string().min(1).refine(
  value => !["__proto__", "constructor", "prototype"].includes(value),
  "Reserved identifier",
)
const editSchema = z.object({
  componentId: identifier,
  field: identifier,
  before: z.string().nullable(),
  after: z.string().nullable(),
}).strict()
const editsSchema = z.array(editSchema).min(1)
export type Edit = z.infer<typeof editSchema>
export interface Component { id: string; component: string; props: Record<string, string> }
/** All visible components of one surface. Versions increase on every successful write. */
export interface Surface { id: string; version: number; components: Component[] }
export interface FieldCheck { source: string; issues: Diagnostic[] }
export type FieldPolicy = (component: Component, edit: Edit) => FieldCheck
export interface Verification extends Edit, FieldCheck { valid: boolean }

export const buttonGuidelines = "src/components/ui/button.guidelines.md#varianten--wann-welche"

const order = (a: string, b: string) => a < b ? -1 : a > b ? 1 : 0

/** Evaluate the complete resulting surface, including untouched default-primary buttons. */
export function verifyChanges(base: Surface, input: unknown, policy: FieldPolicy) {
  const edits = editsSchema.parse(input).sort((a, b) =>
    order(a.componentId, b.componentId) || order(a.field, b.field))
  if (!base.id || !Number.isSafeInteger(base.version) || base.version < 0 ||
      base.version >= Number.MAX_SAFE_INTEGER) throw new Error("Invalid surface identity or version.")
  const components = structuredClone(base.components)
  const byId = new Map(components.map(node => [node.id, node]))
  if (byId.size !== components.length) throw new Error("Duplicate component ID in surface.")
  const seen = new Set<string>()
  const fields: Verification[] = []
  for (const edit of edits) {
    const node = byId.get(edit.componentId)
    const key = JSON.stringify([edit.componentId, edit.field])
    const source = `surface/${encodeURIComponent(base.id)}/${encodeURIComponent(edit.componentId)}/${encodeURIComponent(edit.field)}`
    const fail = (code: string, reason: string) =>
      fields.push({ ...edit, source, valid: false, issues: [{ code, reason, source }] })
    if (!node) { fail("missing-component", "Component is absent from the base version."); continue }
    if (seen.has(key)) { fail("duplicate-edit", "Each field can change only once per proposal."); continue }
    seen.add(key)
    const old = Object.hasOwn(node.props, edit.field) ? node.props[edit.field] : null
    if (old !== edit.before) { fail("stale-value", "The previous value differs from the inspected value."); continue }
    if (old === edit.after) { fail("unchanged", "The proposal leaves this value unchanged."); continue }
    if (edit.after === null) delete node.props[edit.field]
    else node.props[edit.field] = edit.after
    fields.push({ ...edit, source, valid: true, issues: [] })
  }
  const primaryIds = components.filter(c => isPrimaryButton(c.component, c.props.variant)).map(c => c.id)
  const surfaceIssues: Diagnostic[] = primaryIds.length > 1 ? [{
    code: "duplicate-primary", source: buttonGuidelines,
    reason: `Buttons ${primaryIds.join(", ")} compete for the one primary action on '${base.id}'.`,
    replacement: "Keep the main action primary and set the other button's variant to outline.",
  }] : []
  for (const field of fields) {
    if (!field.valid) continue
    const check = policy(byId.get(field.componentId)!, field)
    field.source = check.source
    field.issues = [...check.issues]
    if (field.field === "variant" && primaryIds.includes(field.componentId)) field.issues.push(...surfaceIssues)
    field.valid = field.issues.length === 0
  }
  const valid = fields.every(field => field.valid) && surfaceIssues.length === 0
  return { valid, fields, surfaceIssues, components }
}

export class RejectedProposal extends Error {
  readonly report: ReturnType<typeof verifyChanges>
  constructor(report: ReturnType<typeof verifyChanges>) {
    super("Guardrails rejected the proposal.")
    this.report = report
  }
}

export interface Stage {
  surfaceId: string
  version: number
  edits: Edit[]
  rollback: Edit[]
  digest: string
}

function editTuple(edit: Edit) {
  return [edit.componentId, edit.field, edit.before, edit.after]
}

async function payloadDigest({ surfaceId, version, edits, rollback }: Omit<Stage, "digest">) {
  // Tuples stay canonical across JSON stores that reorder object properties.
  const payload = ["governance/v1", surfaceId, version, edits.map(editTuple), rollback.map(editTuple)]
  const bytes = new TextEncoder().encode(JSON.stringify(payload))
  const hash = await crypto.subtle.digest("SHA-256", bytes)
  return Array.from(new Uint8Array(hash), byte => byte.toString(16).padStart(2, "0")).join("")
}

async function prepare(base: Surface, input: unknown, policy: FieldPolicy) {
  const report = verifyChanges(base, input, policy)
  if (!report.valid) throw new RejectedProposal(report)
  const edits = report.fields.map(({ componentId, field, before, after }) => ({ componentId, field, before, after }))
  const rollback = edits.slice().reverse().map(edit => ({ ...edit, before: edit.after, after: edit.before }))
  const payload = { surfaceId: base.id, version: base.version, edits, rollback }
  const stage: Stage = { ...payload, digest: await payloadDigest(payload) }
  return { stage, next: { id: payload.surfaceId, version: payload.version + 1, components: report.components } }
}

export async function stageChanges(base: Surface, input: unknown, policy: FieldPolicy): Promise<Stage> {
  return (await prepare(base, input, policy)).stage
}

/** Implement compareAndSwap as a single conditional write in a shared backing store. */
export interface SurfaceStore {
  read(id: string): Promise<Surface>
  compareAndSwap(id: string, expectedVersion: number, next: Surface): Promise<boolean>
}

export async function commitChanges(store: SurfaceStore, proposal: Stage, approvedDigest: string, policy: FieldPolicy) {
  const staged = structuredClone(proposal)
  const base = await store.read(staged.surfaceId)
  if (base.id !== staged.surfaceId || base.version !== staged.version) throw new Error("Stale surface version.")
  const { stage: verified, next } = await prepare(base, staged.edits, policy)
  if (verified.digest !== approvedDigest || verified.digest !== staged.digest ||
      JSON.stringify(verified.rollback.map(editTuple)) !== JSON.stringify(staged.rollback.map(editTuple))) throw new Error("Approval digest mismatch.")
  if (!await store.compareAndSwap(staged.surfaceId, staged.version, next)) throw new Error("Concurrent surface modification.")
  return next
}

export async function stageRollback(current: Surface, committed: Stage, policy: FieldPolicy) {
  if (current.id !== committed.surfaceId || current.version !== committed.version + 1) {
    throw new Error("Rollback requires the exact committed surface version.")
  }
  const { digest, surfaceId, version, edits, rollback } = structuredClone(committed)
  const snapshot = structuredClone(current)
  if (await payloadDigest({ surfaceId, version, edits, rollback }) !== digest) {
    throw new Error("Rollback digest mismatch.")
  }
  return stageChanges(snapshot, rollback, policy)
}

export interface Acknowledgement {
  readonly requestId: string
  readonly digest: string
  readonly timestamp: string
}
export interface Receipt<T> extends Acknowledgement {
  readonly result: Promise<T>
}

/** Session-local ledger. Uncertain writes stay reserved until the ledger is reconciled. */
export function createToolLedger<T>(retentionMs = 300_000, capacity = 1024) {
  if (!Number.isSafeInteger(retentionMs) || retentionMs < 8000 || !Number.isSafeInteger(capacity) || capacity < 1) {
    throw new Error("Invalid receipt retention or capacity.")
  }
  const entries = new Map<string, { receipt: Receipt<T>; expiresAt: number; uncertain: boolean }>()
  function lookup(requestId: string) {
    const entry = entries.get(requestId)
    if (entry && Date.now() >= entry.expiresAt) entries.delete(requestId)
    return entries.get(requestId)?.receipt
  }
  function submit(requestId: string, digest: string, operation: (ack: Acknowledgement) => Promise<T>): Receipt<T> {
    if (!requestId.trim() || !/^[a-f0-9]{64}$/.test(digest)) throw new Error("Missing request ID or invalid digest.")
    const now = Date.now()
    for (const [id, entry] of entries) if (now >= entry.expiresAt) entries.delete(id)
    const previous = entries.get(requestId)
    if (previous) {
      if (previous.receipt.digest !== digest) throw new Error("Request ID already binds a different payload.")
      return previous.receipt
    }
    if (entries.size >= capacity) throw new Error("Receipt ledger full. Reconcile outstanding requests.")
    const ack = Object.freeze({ requestId, digest, timestamp: new Date(now).toISOString() })
    const result = Promise.resolve().then(() => operation(ack))
    const receipt = Object.freeze({ ...ack, result })
    const entry = { receipt, expiresAt: Infinity, uncertain: false }
    entries.set(requestId, entry)
    // A rejected transport promise can follow a successful remote write.
    void result.then(() => { entry.expiresAt = Date.now() + retentionMs }, () => { entry.uncertain = true })
    return receipt
  }
  // Called only after the target system confirms the write had no effect.
  function confirmUnapplied(requestId: string, digest: string) {
    const entry = entries.get(requestId)
    if (!entry?.uncertain || entry.receipt.digest !== digest) return false
    return entries.delete(requestId)
  }
  return { submit, lookup, confirmUnapplied }
}

// Baseline S/O/D from the enterprise interface FMEA. Targets require measured evidence.
export const fmea = {
  verification: { id: "F4", severity: 6, occurrence: 7, detection: 8 },
  commit: { id: "F5", severity: 9, occurrence: 5, detection: 10 },
  receipt: { id: "F3", severity: 7, occurrence: 8, detection: 7 },
  rollback: { id: "F6", severity: 10, occurrence: 4, detection: 10 },
} as const
