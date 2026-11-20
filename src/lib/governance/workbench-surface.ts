import buttonMetadata from "../../components/ui/button.meta.json"
import type { Edit, Surface, SurfaceStore } from "./fmea-guardrails"

export function initialButtonSurface(): Surface {
  return {
    id: "workbench-buttons", version: 1,
    components: buttonMetadata.variants.map(({ name }) => ({
      id: name === "primary" ? "publish" : name === "outline" ? "save-draft" : name,
      component: "Button", props: { variant: name },
    })),
  }
}

export function workbenchProposal(surface: Surface, testCase: boolean): Edit[] {
  const main = surface.components.find(button => button.props.variant === "primary")!
  const other = surface.components.find(button => button.props.variant === "outline")!
  return [
    testCase
      ? { componentId: main.id, field: "className", before: null, after: "bg-[#ff0000] text-white" }
      : { componentId: main.id, field: "variant", before: "primary", after: "outline" },
    { componentId: other.id, field: "variant", before: "outline", after: "primary" },
  ]
}

/** Local adapter for the Workbench. Each mounted Workbench owns one surface. */
export function createWorkbenchStore(initial: Surface, publish: (next: Surface) => void): SurfaceStore {
  let current = structuredClone(initial)
  return {
    async read(id) {
      if (current.id !== id) throw new Error("Unknown surface.")
      return structuredClone(current)
    },
    async compareAndSwap(id, expectedVersion, next) {
      if (current.id !== id || current.version !== expectedVersion ||
          next.id !== id || next.version !== expectedVersion + 1) return false
      current = structuredClone(next)
      publish(structuredClone(current))
      return true
    },
  }
}
