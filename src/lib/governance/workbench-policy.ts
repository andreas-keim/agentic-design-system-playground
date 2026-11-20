import tokens from "../../tokens/tokens.json"
import buttonMetadata from "../../components/ui/button.meta.json"
import { buttonGuidelines } from "./fmea-guardrails"
import type { FieldPolicy } from "./fmea-guardrails"
import { createTokenLinter } from "./token-validator"

export const primaryToken = "color.background.primary.default"
export const workbenchScope = { domain: "playground", journey: "workbench", actor: "design-agent" }
const linter = createTokenLinter(tokens, "src/tokens/tokens.json")
const primarySlot = { scope: workbenchScope, purpose: "primary-action", agency: 2, expected: primaryToken } as const
const variants = buttonMetadata.variants.map(variant => variant.name).filter(name => name !== "secondary")

export const workbenchPolicy: FieldPolicy = (node, edit) => {
  if (node.component === "Button") {
    if (edit.field === "variant" && variants.includes(edit.after ?? "primary")) {
      if ((edit.after ?? "primary") === "primary") {
        return { source: linter.source(primaryToken), issues: linter.lint(primaryToken, primarySlot) }
      }
      return { source: buttonGuidelines, issues: [] }
    }
    if (edit.field === "className" && edit.after !== null && (node.props.variant ?? "primary") === "primary") {
      const issues = linter.lint(edit.after, primarySlot)
      issues.push({
        code: "forbidden-class", source: "src/a2ui/catalog.api.ts#ButtonApi",
        reason: `Button.className is outside the agent catalog. Remove '${edit.after}' and use the primary variant.`,
        ...(linter.lint(primaryToken, primarySlot).length ? {} : { replacement: primaryToken }),
      })
      return { source: linter.source(primaryToken), issues }
    }
    if (edit.field === "className" && edit.after === null) {
      return { source: "src/a2ui/catalog.api.ts#ButtonApi", issues: [] }
    }
  }
  return { source: buttonGuidelines, issues: [{
    code: "unsupported-field", source: buttonGuidelines,
    reason: `'${node.component}.${edit.field}' cannot be set to '${edit.after}' by the workbench agent.`,
    ...(edit.field === "variant" && edit.after === "secondary" ? { replacement: "outline" } : {}),
  }] }
}
