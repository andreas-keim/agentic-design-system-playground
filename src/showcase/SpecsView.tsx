import { User, ExternalLink, Award } from "lucide-react"

export function SpecsView() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Author & Strategic Mission */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold font-mono">
                AK
              </div>
              <div>
                <h3 className="font-bold text-foreground text-sm">Andreas Keim</h3>
                <p className="text-xs text-muted-foreground font-mono">Senior UX Designer / Staff Design Engineer</p>
              </div>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed mb-4">
              8+ years of enterprise product design experience across B2B platforms, Design Systems, and Human-in-the-Loop AI interfaces.
            </p>

            <div className="space-y-2 text-xs font-mono">
              <div className="flex items-center justify-between border-b border-border py-1.5">
                <span className="text-muted-foreground">Target Tier:</span>
                <span className="font-semibold text-foreground">Senior / Staff (90k–95k €)</span>
              </div>
              <div className="flex items-center justify-between border-b border-border py-1.5">
                <span className="text-muted-foreground">Target Roles:</span>
                <span className="font-semibold text-foreground">AI Product Design / Design Eng</span>
              </div>
              <div className="flex items-center justify-between py-1.5">
                <span className="text-muted-foreground">Location:</span>
                <span className="font-semibold text-foreground">Nürnberg / Munich (Hybrid)</span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-border flex gap-2">
            <a
              href="https://linkedin.com/in/andreas-keim-ux"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-md bg-primary px-3 py-2 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors shadow-xs"
            >
              <User className="h-3.5 w-3.5" />
              LinkedIn Profile
            </a>
            <a
              href="https://github.com/andreas-keim"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1.5 rounded-md border border-border bg-card px-3 py-2 text-xs font-medium text-foreground hover:bg-muted/40 transition-colors"
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>

        {/* Right Columns: Architectural Decisions & Pipeline */}
        <div className="lg:col-span-2 rounded-xl border border-border bg-card p-6 shadow-xs space-y-6">
          <div>
            <h3 className="text-base font-bold text-foreground flex items-center gap-2 mb-2">
              <Award className="h-4 w-4 text-emerald-500" />
              Core Architectural Pillars
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Why this system bridges the gap between design craft and deterministic software engineering.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-xs">
            <div className="rounded-lg border border-border bg-muted/20 p-4">
              <span className="text-blue-500 font-bold block mb-1">ADR-01 // Custom Showcase App</span>
              <p className="text-[11px] text-muted-foreground leading-normal font-sans">
                A bespoke Interactive Control Room on the root route (<code className="font-mono text-[10px] bg-muted px-1 rounded">/</code>) instead of static Storybook trees proves product craft and UX architecture mastery.
              </p>
            </div>

            <div className="rounded-lg border border-border bg-muted/20 p-4">
              <span className="text-emerald-500 font-bold block mb-1">ADR-02 // Pure Client-Side A2UI</span>
              <p className="text-[11px] text-muted-foreground leading-normal font-sans">
                Deterministic validation running purely in the browser (&lt; 2ms latency) with zero paid backend LLM APIs and 0.00 € Vercel Hobby hosting.
              </p>
            </div>

            <div className="rounded-lg border border-border bg-muted/20 p-4">
              <span className="text-purple-500 font-bold block mb-1">ADR-03 // Enterprise B2B Domain</span>
              <p className="text-[11px] text-muted-foreground leading-normal font-sans">
                Universal mission-critical domain context (System Record Access, Clearance Levels, SSO Provisioning) designed for enterprise decision-makers.
              </p>
            </div>

            <div className="rounded-lg border border-border bg-muted/20 p-4">
              <span className="text-amber-500 font-bold block mb-1">W3C DTCG Token Governance</span>
              <p className="text-[11px] text-muted-foreground leading-normal font-sans">
                Strict semantic hierarchy (<code className="font-mono text-[10px] bg-muted px-1 rounded">Category.Subcategory.Role.State</code>) compiled via Style Dictionary into CSS variables and TypeScript union types.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
