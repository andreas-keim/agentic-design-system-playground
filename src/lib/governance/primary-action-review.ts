import { verifyChanges, type Component, type Edit, type Surface } from "./fmea-guardrails"
import { isPrimaryButton } from "./primary-button"
import { workbenchPolicy } from "./workbench-policy"

function primaryAction(components: Component[]) {
  const actions = components.filter(node => isPrimaryButton(node.component, node.props.variant))
  return actions.length === 1 ? actions[0].id : undefined
}

/** Editorial workflow policy: check design constraints before assessing the change of intent. */
export function reviewPrimaryAction(surface: Surface, edits: Edit[]) {
  const report = verifyChanges(surface, edits, workbenchPolicy)
  if (!report.valid) return { kind: "blocked", report } as const
  const before = primaryAction(surface.components)
  const after = primaryAction(report.components)
  if (before && after && before !== after) {
    return { kind: "review", rule: "primary-action-transfer", before, after, report } as const
  }
  return { kind: "no-transfer", report } as const
}
