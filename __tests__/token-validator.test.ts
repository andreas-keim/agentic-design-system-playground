import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import tokens from "../src/tokens/tokens.json"
import { createTokenLinter, validateToken } from "../src/lib/governance/token-validator"
import {
  commitChanges, createToolLedger, fmea, RejectedProposal, stageChanges, stageRollback, verifyChanges,
} from "../src/lib/governance/fmea-guardrails"
import type { Edit, Surface } from "../src/lib/governance/fmea-guardrails"
import {
  primaryToken, workbenchPolicy, workbenchScope,
} from "../src/lib/governance/workbench-policy"

import { createWorkbenchStore, initialButtonSurface, workbenchProposal } from "../src/lib/governance/workbench-surface"

beforeEach(() => { vi.useFakeTimers(); vi.setSystemTime(new Date("2026-11-20T10:00:00Z")) })
afterEach(() => { vi.useRealTimers(); vi.restoreAllMocks() })

const leaf = tokens.color.background.primary.default
const linter = createTokenLinter(tokens, "tokens.json")
const slot = { purpose: "primary-action", scope: workbenchScope, agency: 2, expected: primaryToken } as const

describe("schema and semantic usage", () => {
  it("validates the governed leaf and reports exact paths for legacy metadata", () => {
    expect(validateToken(leaf)).toEqual([])
    expect(validateToken(tokens.color.brand.copper)).toEqual(expect.arrayContaining([
      expect.objectContaining({ code: "schema.required", source: "#/$extensions/agentic/evidence" }),
      expect.objectContaining({ code: "schema.type", source: "#/$extensions/agentic/avoidFor" }),
    ]))
  })

  it.each([
    ["maxAgency", 5, "maximum"], ["reviewBy", "2026-02-31T00:00:00Z", "format"],
    ["evidence", [], "minItems"], ["useFor", ["primary-action", "primary-action"], "uniqueItems"],
    ["selfApproved", true, "additionalProperties"],
  ])("checks %s against the repository schema", (field, value, keyword) => {
    const token = { ...leaf, $extensions: { agentic: { ...leaf.$extensions.agentic, [String(field)]: value } } }
    expect(validateToken(token)).toContainEqual(expect.objectContaining({
      source: "#/$extensions/agentic/" + field, code: "schema." + keyword,
    }))
  })

  it.each(["#f00", "#abcd", "#AABBCC", "hover:bg-[#ff0000]/50", "[color:#11223344]"])(
    "returns the semantic replacement for %s", value => {
      expect(linter.lint(value, slot)).toEqual([expect.objectContaining({
        code: "inline-hex", replacement: primaryToken, reason: expect.stringContaining(value),
      })])
    },
  )

  it("reads the actual avoidFor field and checks the replacement before recommending it", () => {
    expect(linter.lint("color.background.surface", slot)).toEqual([{
      code: "avoid-for", source: "tokens.json#/color/background/surface/$extensions/agentic/avoidFor",
      reason: "surface-background: 'color.background.surface' forbids 'primary-action'.", replacement: primaryToken,
    }])
    expect(linter.lint("{color.background.primary.default}", slot)).toEqual([])
    const issues = linter.lint("#ff0000", slot, Date.parse(leaf.$extensions.agentic.reviewBy))
    expect(issues.some(issue => issue.code === "review-due")).toBe(true)
    expect(issues.every(issue => !issue.replacement)).toBe(true)
  })

  it("blocks scope mismatches, unlisted purposes and missing tokens", () => {
    expect(linter.lint(primaryToken, { ...slot, agency: 3 })[0].code).toBe("max-agency")
    expect(linter.lint(primaryToken, { ...slot, scope: { ...slot.scope, actor: "operator" } })[0].code).toBe("scope")
    expect(linter.lint(primaryToken, { ...slot, purpose: "unknown-role" })[0].code).toBe("use-for")
    expect(linter.lint("bg-red-500", slot)[0]).toMatchObject({ code: "unknown-token", replacement: primaryToken })
  })

  it("rejects broken and cyclic aliases even when the first leaf is schema-valid", () => {
    const registry = { root: { ...leaf, $value: "{next}" }, next: { $value: "{root}" } }
    const context = { ...slot, expected: "root" }
    expect(createTokenLinter(registry, "tokens").lint("root", context)[0].code).toBe("alias-cycle")
    expect(createTokenLinter({ root: registry.root }, "tokens").lint("root", context)[0].code).toBe("unknown-token")
  })
})

describe("verification and transactional changes", () => {
  let base: Surface
  let valid: Edit[]
  beforeEach(() => { base = initialButtonSurface(); valid = workbenchProposal(base, false) })

  it("case 03 rejects the raw color and both primary buttons deterministically before a write", async () => {
    const store = createWorkbenchStore(base, () => { throw new Error("Unexpected mutation") })
    const writes = vi.spyOn(store, "compareAndSwap")
    const input = workbenchProposal(base, true)
    const first = verifyChanges(base, input, workbenchPolicy)
    expect(verifyChanges(base, input.slice().reverse(), workbenchPolicy)).toEqual(first)
    expect(first.valid).toBe(false)
    expect(first.fields.map(field => field.valid)).toEqual([false, false])
    expect(first.fields.flatMap(field => field.issues)).toEqual(expect.arrayContaining([
      expect.objectContaining({ code: "inline-hex", replacement: primaryToken }),
      expect.objectContaining({ code: "duplicate-primary", replacement: expect.stringContaining("outline") }),
    ]))
    await expect(stageChanges(base, input, workbenchPolicy)).rejects.toBeInstanceOf(RejectedProposal)
    const forged = { ...await stageChanges(base, valid, workbenchPolicy), edits: input }
    await expect(commitChanges(store, forged, forged.digest, workbenchPolicy)).rejects.toMatchObject({ report: first })
    expect(writes).not.toHaveBeenCalled()
    expect(await store.read(base.id)).toEqual(base)
  })

  it("counts untouched default-primary buttons and reports each field's source", () => {
    delete base.components.find(c => c.id === "publish")!.props.variant
    const result = verifyChanges(base, [valid[1]], workbenchPolicy)
    expect(result.fields[0]).toMatchObject({ source: expect.stringContaining("tokens.json#/color/"), valid: false })
    expect(result.surfaceIssues[0].code).toBe("duplicate-primary")
  })

  it("rejects stale values, unknown targets, duplicate edits and unsupported fields", () => {
    for (const [input, code] of [
      [[{ ...valid[0], before: "ghost" }], "stale-value"],
      [[{ ...valid[0], componentId: "missing" }], "missing-component"],
      [[valid[0], valid[0]], "duplicate-edit"],
      [[{ ...valid[0], field: "arbitrary", before: null }], "unsupported-field"],
    ] as const) {
      const report = verifyChanges(base, input, workbenchPolicy)
      expect(report.valid).toBe(false)
      expect(report.fields.flatMap(f => f.issues).some(issue => issue.code === code)).toBe(true)
    }
    expect(() => verifyChanges(base, [{}], workbenchPolicy)).toThrow()
  })

  it("binds scope, version and normalized edits to SHA-256", async () => {
    const stage = await stageChanges(base, valid, workbenchPolicy)
    expect(stage.digest).toMatch(/^[0-9a-f]{64}$/)
    expect((await stageChanges(base, valid.slice().reverse(), workbenchPolicy)).digest).toBe(stage.digest)
    for (const changed of [{ ...base, id: "other" }, { ...base, version: 2 }]) {
      expect((await stageChanges(changed, valid, workbenchPolicy)).digest).not.toBe(stage.digest)
    }
    const store = createWorkbenchStore(base, () => {})
    await expect(commitChanges(store, stage, "unapproved", workbenchPolicy)).rejects.toThrow("digest")
    await expect(commitChanges(store, { ...stage, rollback: [] }, stage.digest, workbenchPolicy)).rejects.toThrow("digest")
    const changed = await stageChanges(base, [{ ...valid[0], after: "ghost" }], workbenchPolicy)
    await expect(commitChanges(store, changed, stage.digest, workbenchPolicy)).rejects.toThrow("digest")
    expect(await store.read(base.id)).toEqual(base)
  })

  it("allows one concurrent commit and restores exactly the changed fields after separate approval", async () => {
    const store = createWorkbenchStore(base, () => {})
    const stage = await stageChanges(base, valid, workbenchPolicy)
    const result = await Promise.allSettled([1, 2].map(() => commitChanges(store, stage, stage.digest, workbenchPolicy)))
    expect(result.map(r => r.status).sort()).toEqual(["fulfilled", "rejected"])
    const next = await store.read(base.id)
    expect(next.version).toBe(2)
    expect(next.components.find(c => c.id === "save-draft")!.props.variant).toBe("primary")
    await expect(commitChanges(store, stage, stage.digest, workbenchPolicy)).rejects.toThrow("Stale")
    await expect(stageRollback({ ...next, version: 3 }, stage, workbenchPolicy)).rejects.toThrow("version")
    await expect(stageRollback(next, { ...stage, rollback: [] }, workbenchPolicy)).rejects.toThrow("digest")
    const undo = await stageRollback(next, stage, workbenchPolicy)
    expect(undo.digest).not.toBe(stage.digest)
    const restored = await commitChanges(store, undo, undo.digest, workbenchPolicy)
    expect(restored).toEqual({ ...base, version: 3 })
  })

  it("rates the documented failure modes using S x O x D", () => {
    expect(Object.values(fmea).map(r => r.severity * r.occurrence * r.detection)).toEqual([336, 450, 392, 400])
  })
})

describe("tool acknowledgements", () => {
  const digest = "ab".repeat(32)
  it("acknowledges immediately and replays the same receipt during and after a slow call", async () => {
    const ledger = createToolLedger<number>(8000)
    const operation = vi.fn(() => new Promise<number>(resolve => setTimeout(() => resolve(42), 9000)))
    const first = ledger.submit("r1", digest, operation)
    expect(first.timestamp).toBe("2026-11-20T10:00:00.000Z")
    for (const delay of [2000, 3000, 3000]) {
      await vi.advanceTimersByTimeAsync(delay)
      expect(ledger.submit("r1", digest, operation)).toBe(first)
      expect(ledger.lookup("r1")).toBe(first)
    }
    expect(() => ledger.submit("r1", "cd".repeat(32), operation)).toThrow("different payload")
    await vi.advanceTimersByTimeAsync(1000)
    expect(await first.result).toBe(42)
    expect(ledger.submit("r1", digest, operation)).toBe(first)
    expect(operation).toHaveBeenCalledExactlyOnceWith({ requestId: "r1", digest, timestamp: first.timestamp })
    await vi.advanceTimersByTimeAsync(8000)
    expect(ledger.lookup("r1")).toBeUndefined()
  })

  it("preserves uncertain outcomes and fails closed at capacity until reconciled", async () => {
    const ledger = createToolLedger<number>(8000, 1)
    const operation = vi.fn(async () => { throw new Error("Connection lost after dispatch") })
    const first = ledger.submit("r1", digest, operation)
    await expect(first.result).rejects.toThrow("after dispatch")
    await vi.advanceTimersByTimeAsync(10000)
    expect(ledger.submit("r1", digest, operation)).toBe(first)
    expect(() => ledger.submit("r2", digest, operation)).toThrow("full")
    expect(ledger.confirmUnapplied("r1", "wrong")).toBe(false)
    expect(operation).toHaveBeenCalledTimes(1)
    expect(ledger.confirmUnapplied("r1", digest)).toBe(true)
    expect(await ledger.submit("r1", digest, async () => 7).result).toBe(7)
  })
})
