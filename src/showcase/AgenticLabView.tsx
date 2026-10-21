import { Cpu, ShieldCheck, Sparkles } from "lucide-react"

export function AgenticLabView() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="rounded-xl border border-border bg-card p-8 text-center max-w-2xl mx-auto shadow-xs">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary mb-4">
          <Cpu className="h-6 w-6" />
        </div>
        <h2 className="text-xl font-bold tracking-tight text-foreground mb-2">
          Agentic UI Lab (Phase 2 Preview)
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed mb-6">
          The deterministic validation engine (<code className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded text-foreground">check.ts</code>) is consolidated and ready. Here, we will present the interactive side-by-side stress test: Ungoverned LLM output vs. W3C Guardrailed UI.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left font-mono text-xs">
          <div className="rounded-lg border border-border bg-muted/30 p-3">
            <span className="text-muted-foreground text-[10px] block uppercase">Engine</span>
            <span className="font-semibold text-foreground flex items-center gap-1.5 mt-1">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
              A2UI Core v0.12
            </span>
          </div>
          <div className="rounded-lg border border-border bg-muted/30 p-3">
            <span className="text-muted-foreground text-[10px] block uppercase">Validation</span>
            <span className="font-semibold text-foreground flex items-center gap-1.5 mt-1">
              <Sparkles className="h-3.5 w-3.5 text-blue-500" />
              Pure Client AST
            </span>
          </div>
          <div className="rounded-lg border border-border bg-muted/30 p-3">
            <span className="text-muted-foreground text-[10px] block uppercase">Latency</span>
            <span className="font-semibold text-emerald-500 mt-1 block">&lt; 2ms Client Exec</span>
          </div>
        </div>
      </div>
    </div>
  )
}
