import { expect, it } from "vitest"
import { initialButtonSurface, workbenchProposal } from "../src/lib/governance/workbench-surface"
import { reviewPrimaryAction } from "../src/lib/governance/primary-action-review"

const surface = initialButtonSurface()
const swap = workbenchProposal(surface, false)

it("requires review for a valid transfer and identifies both actions", () => {
  expect(reviewPrimaryAction(surface, swap)).toMatchObject({
    kind: "review", before: "publish", after: "save-draft", rule: "primary-action-transfer",
  })
})

it("blocks competing primary actions before asking for approval", () => {
  const decision = reviewPrimaryAction(surface, [swap[1]])
  expect(decision.kind).toBe("blocked")
  expect(decision.report.surfaceIssues[0].code).toBe("duplicate-primary")
})

it("does not trigger the transfer rule for an unrelated valid edit", () => {
  expect(reviewPrimaryAction(surface, [
    { componentId: "save-draft", field: "variant", before: "outline", after: "ghost" },
  ]).kind).toBe("no-transfer")
})
