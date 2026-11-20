import { createElement as h } from "react"
import { flushSync } from "react-dom"
import { createRoot, type Root } from "react-dom/client"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { page, userEvent } from "vitest/browser"
import { ApprovalGate, type ApprovalGateProps } from "../src/components/ax/ApprovalGate"
import { GuardrailInspector } from "../src/components/governance/GuardrailInspector"
import { SourceAttributionBadge, type AgentSource, type ManualSource } from "../src/components/ax/SourceAttributionBadge"
import { commitChanges, stageChanges, stageRollback, type Surface } from "../src/lib/governance/fmea-guardrails"
import { createWorkbenchStore, initialButtonSurface } from "../src/lib/governance/workbench-surface"
import "../src/index.css"

const base: Surface = { id: "contacts", version: 4, components: [
  { id: "contact-7", component: "Contact", props: { name: "Ada" } },
] }
const edit = { componentId: "contact-7", field: "name", before: "Ada", after: "Ada Kim" }
const policy = () => ({ source: "contact-policy", issues: [] })
const stage = await stageChanges(base, [edit], policy)
const manual: ManualSource = {
  kind: "manual", digest: "ab".repeat(32), timestamp: "2026-11-18T08:17:00Z",
}
const timestamp = "2026-11-20T09:45:00Z"
let host: HTMLDivElement
let opener: HTMLButtonElement
let root: Root
beforeEach(() => {
  opener = document.createElement("button")
  opener.textContent = "Review"
  host = document.createElement("div")
  document.body.append(opener, host)
  opener.focus()
  root = createRoot(host)
})
afterEach(() => {
  root.unmount()
  host.remove()
  opener.remove()
  vi.useRealTimers()
})

const button = (name: string | RegExp) => page.getByRole("button", { name })
const dialog = () => page.getByRole("dialog")
function renderGate(overrides: Partial<ApprovalGateProps> = {}) {
  const props = {
    stage, impactSummary: "Der Name im Kontaktverzeichnis ändert sich.",
    onCommit: vi.fn(), onReject: vi.fn(), ...overrides,
  }
  flushSync(() => root.render(h(ApprovalGate, props)))
  return props
}

function clock() {
  vi.useFakeTimers({ toFake: ["Date", "setTimeout", "clearTimeout", "setInterval", "clearInterval"] })
}
function advance(ms: number) {
  flushSync(() => { vi.advanceTimersByTime(ms) })
}

describe("ApprovalGate", () => {
  it("names and describes the modal, shows the scoped diff, traps Tab and restores focus on Escape", async () => {
    const { onReject, onCommit } = renderGate()
    await expect.element(dialog()).toHaveAccessibleName("Änderungen prüfen")
    await expect.element(dialog()).toHaveAccessibleDescription(/Kontaktverzeichnis.*contacts \(Version 4\).*1 Datensatz/)
    await expect.element(dialog()).toHaveAttribute("aria-modal", "true")
    expect(dialog().element().querySelector("del")?.textContent).toBe("Ada")
    expect(dialog().element().querySelector("ins")?.textContent).toBe("Ada Kim")
    await expect.element(page.getByRole("status")).toHaveAttribute("aria-live", "polite")
    const reject = button(/Ablehnen/)
    await expect.element(reject).toHaveFocus()
    await userEvent.keyboard("{Shift>}{Tab}{/Shift}")
    await expect.element(page.getByText("Rollback-Vorschau und Prüfsumme")).toHaveFocus()
    await userEvent.keyboard("{Shift>}{Tab}{/Shift}")
    await expect.element(button("Änderungen freigeben")).toHaveFocus()
    await userEvent.keyboard("{Tab}")
    await expect.element(page.getByText("Rollback-Vorschau und Prüfsumme")).toHaveFocus()
    await userEvent.keyboard("{Tab}")
    await expect.element(reject).toHaveFocus()
    await userEvent.keyboard("{Escape}")
    await expect.element(dialog()).not.toBeInTheDocument()
    await expect.poll(() => document.activeElement).toBe(opener)
    expect(onReject).toHaveBeenCalledOnce()
    expect(onCommit).not.toHaveBeenCalled()
  })

  it("rejects with one click", async () => {
    const { onReject, onCommit } = renderGate()
    await button(/Ablehnen/).click()
    expect(onReject).toHaveBeenCalledOnce()
    expect(onCommit).not.toHaveBeenCalled()
  })

  it("dispatches the reviewed digest exactly once, at five seconds", async () => {
    const { onCommit } = renderGate()
    clock()
    await button("Änderungen freigeben").click()
    await expect.element(page.getByRole("status")).toHaveTextContent("Übernahme in 5 Sekunden.")
    advance(4000)
    await expect.element(page.getByRole("status")).toHaveTextContent("Übernahme in 1 Sekunde.")
    advance(999)
    expect(onCommit).not.toHaveBeenCalled()
    advance(1)
    advance(5000)
    expect(onCommit).toHaveBeenCalledExactlyOnceWith(stage, stage.digest)
  })

  it.each(["Escape", "button"])("cancels the pending write via %s at the last millisecond", async method => {
    const { onReject, onCommit } = renderGate()
    clock()
    await button("Änderungen freigeben").click()
    advance(4999)
    const undo = button(/Freigabe zurücknehmen/)
    await expect.element(undo).toHaveFocus()
    if (method === "Escape") await userEvent.keyboard("{Escape}")
    else await undo.click()
    advance(5001)
    expect(onReject).toHaveBeenCalledOnce()
    expect(onCommit).not.toHaveBeenCalled()
  })

  it("commits immediately when the undo window is disabled", async () => {
    const { onCommit } = renderGate({ allowUndo: false })
    await button("Änderungen freigeben").click()
    expect(onCommit).toHaveBeenCalledExactlyOnceWith(stage, stage.digest)
  })

  it("invalidates approval when the proposal changes and on unmount", async () => {
    const replacement = await stageChanges(base, [{ ...edit, after: "Ada Lee" }], policy)
    const { onCommit } = renderGate()
    clock()
    await button("Änderungen freigeben").click()
    advance(2000)
    renderGate({ stage: replacement, onCommit })
    advance(5000)
    await expect.element(button("Änderungen freigeben")).toBeVisible()
    await button("Änderungen freigeben").click()
    flushSync(() => root.render(null))
    advance(5000)
    expect(onCommit).not.toHaveBeenCalled()
  })
})

it("stages the Workbench proposal and commits the reviewed change through the store", async () => {
  clock()
  vi.setSystemTime(new Date("2026-11-20T10:00:00Z"))
  const initial = initialButtonSurface()
  const store = createWorkbenchStore(initial, surface => root.render(h(GuardrailInspector, { surface, store })))
  flushSync(() => root.render(h(GuardrailInspector, { surface: initial, store })))
  await page.getByRole("combobox").selectOptions("valid")
  await button("Stage changes").click()
  await expect.element(dialog()).toHaveAccessibleDescription(/2 Datensätze/)
  await userEvent.keyboard("{Escape}")
  await expect.element(button("Stage changes")).toHaveFocus()
  await button("Stage changes").click()
  await expect.element(dialog()).toBeVisible()
  await button("Änderungen freigeben").click()
  advance(4999)
  expect(await store.read(initial.id)).toEqual(initial)
  advance(1)
  await expect.element(button("Review rollback")).toBeVisible()
  const updated = await store.read(initial.id)
  expect(updated.version).toBe(initial.version + 1)
  expect(updated.components.find(item => item.id === "save-draft")?.props.variant).toBe("primary")
})

describe("SourceAttributionBadge", () => {
  function show(source: ManualSource | AgentSource) {
    flushSync(() => root.render(h(SourceAttributionBadge, { source })))
  }
  function agent(onRollback: AgentSource["onRollback"]): AgentSource {
    return { kind: "agent", model: "Extractor", version: "2.1", digest: stage.digest, timestamp, onRollback }
  }

  it("exposes manual provenance and supports keyboard disclosure and dismissal", async () => {
    show(manual)
    const trigger = button("Manuell")
    await expect.element(trigger).toHaveAttribute("aria-expanded", "false")
    ;(trigger.element() as HTMLButtonElement).focus()
    await userEvent.keyboard("{Enter}")
    await expect.element(trigger).toHaveAttribute("aria-expanded", "true")
    expect(trigger.element().getAttribute("aria-controls")).toBe(dialog().element().id)
    await expect.element(dialog()).toHaveAccessibleName("Herkunft des Feldwerts")
    expect(dialog().element().querySelector("time")?.dateTime).toBe(manual.timestamp)
    expect(dialog().element().querySelector("code")?.textContent).toBe(manual.digest)
    await expect.element(button(/Vor-KI/)).not.toBeInTheDocument()
    await userEvent.keyboard("{Escape}")
    await expect.element(trigger).toHaveFocus()
    await expect.element(dialog()).not.toBeInTheDocument()
  })

  it("restores the stored field and its manual provenance with one click", async () => {
    const store = createWorkbenchStore(base, () => {})
    const current = await commitChanges(store, stage, stage.digest, policy)
    const rollback = vi.fn(async (digest: string) => {
      expect(digest).toBe(stage.digest)
      const inverse = await stageRollback(current, stage, policy)
      await commitChanges(store, inverse, inverse.digest, policy)
      return manual
    })
    show(agent(rollback))
    await button("Agent (Extractor/2.1)").click()
    expect(dialog().element().querySelector("code")?.textContent).toBe(stage.digest)
    expect(dialog().element().querySelector("time")?.dateTime).toBe(timestamp)
    await button("Auf Vor-KI-Version zurücksetzen").click()
    await expect.element(button("Manuell")).toHaveFocus()
    expect(rollback).toHaveBeenCalledExactlyOnceWith(stage.digest)
    expect((await store.read(base.id)).components).toEqual(base.components)
    await button("Manuell").click()
    expect(dialog().element().querySelector("code")?.textContent).toBe(manual.digest)
    await expect.element(button(/Vor-KI/)).not.toBeInTheDocument()
  })

  it("suppresses duplicate writes and keeps agent provenance after a rejected rollback", async () => {
    let reject!: (error: Error) => void
    const response = new Promise<ManualSource>((_, fail) => { reject = fail })
    const rollback = vi.fn(() => response)
    show(agent(rollback))
    await button(/Agent/).click()
    const restore = button(/Vor-KI/)
    await restore.click()
    await expect.element(restore).toHaveAttribute("aria-disabled", "true")
    ;(restore.element() as HTMLButtonElement).click()
    expect(rollback).toHaveBeenCalledOnce()
    reject(new Error("Stale surface version."))
    await expect.element(page.getByRole("alert")).toHaveTextContent("Stale surface version.")
    await expect.element(button(/Agent/)).toBeInTheDocument()
    await expect.element(restore).not.toHaveAttribute("aria-disabled", "true")
  })
})
