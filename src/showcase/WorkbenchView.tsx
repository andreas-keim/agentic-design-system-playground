import { useState } from "react"
import { CheckCircle2 } from "lucide-react"

import { useShowcase } from "./ShowcaseContext"
import { Button } from "@/components/ui/button"
import { FormField } from "@/components/ui/form-field"
import { EditEntryPanel } from "@/components/edit-entry-panel"
import { LoginPage } from "@/components/login-page"

type ActiveComponent = "edit-panel" | "button" | "form-field" | "login-page"
type PinnedState = "default" | "hover" | "focus" | "disabled"

export function WorkbenchView() {
  const { xrayMode } = useShowcase()
  const [activeComponent, setActiveComponent] = useState<ActiveComponent>("edit-panel")
  const [pinnedState, setPinnedState] = useState<PinnedState>("default")

  // Sample Enterprise Record Data
  const [systemRecord, setSystemRecord] = useState<string | null>(
    "SYS-REC-84920 (Cluster Security Officer // Level 3 Restricted)"
  )
  const [recordSavedNotice, setRecordSavedNotice] = useState<string | null>(null)

  function handleSaveRecord(value: string) {
    setSystemRecord(value)
    setRecordSavedNotice("Saved")
    setTimeout(() => setRecordSavedNotice(null), 2500)
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      {/* 2-Column Clean Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: The Component Stage (Canvas) */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          {/* Subtle Component Switcher */}
          <div className="flex items-center gap-1 border-b border-border/60 pb-3">
            {[
              { id: "edit-panel", label: "Edit Record Panel" },
              { id: "button", label: "Button Variants" },
              { id: "form-field", label: "Form Fields" },
              { id: "login-page", label: "Workspace SSO" },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveComponent(item.id as ActiveComponent)}
                className={`rounded-md px-3 py-1.5 text-xs transition-colors ${
                  activeComponent === item.id
                    ? "bg-muted text-foreground font-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* The Stage / Canvas: Isolated, High Breathing Room */}
          <div
            className={`relative min-h-[440px] rounded-xl border border-border/70 bg-card p-12 flex items-center justify-center transition-colors ${
              xrayMode ? "ring-1 ring-blue-500/40" : ""
            }`}
          >
            {/* Subtle Saved Toast */}
            {recordSavedNotice && (
              <div className="absolute top-4 right-4 z-20 flex items-center gap-1.5 rounded bg-muted border border-border px-2.5 py-1 text-xs text-foreground font-mono">
                <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                {recordSavedNotice}
              </div>
            )}

            {/* X-Ray Floating Legend (Only when active) */}
            {xrayMode && (
              <div className="absolute top-4 left-4 z-20 font-mono text-[11px] text-blue-500 bg-blue-500/5 border border-blue-500/20 rounded px-2 py-0.5">
                X-Ray Active
              </div>
            )}

            {/* 1. EditEntryPanel View */}
            {activeComponent === "edit-panel" && (
              <div className="w-full max-w-md">
                {systemRecord === null ? (
                  <div className="rounded-lg border border-dashed border-border/80 p-8 text-center">
                    <p className="text-xs text-muted-foreground mb-3">Record removed.</p>
                    <Button
                      variant="outline"
                      onClick={() =>
                        setSystemRecord("SYS-REC-84920 (Cluster Security Officer // Level 3 Restricted)")
                      }
                    >
                      Reset Record
                    </Button>
                  </div>
                ) : (
                  <div className="relative">
                    {xrayMode && (
                      <span className="absolute -top-3.5 right-2 z-30 rounded bg-blue-600/90 text-white font-mono text-[9px] px-1.5 py-0.5 pointer-events-none">
                        --color-card • --space-component-md
                      </span>
                    )}
                    <EditEntryPanel
                      value={systemRecord}
                      onSave={handleSaveRecord}
                      onCancel={() => {}}
                      onDelete={() => setSystemRecord(null)}
                      className={pinnedState === "disabled" ? "opacity-50 pointer-events-none" : ""}
                    />
                  </div>
                )}
              </div>
            )}

            {/* 2. Button View */}
            {activeComponent === "button" && (
              <div className="flex flex-col gap-6 items-center w-full max-w-md">
                <div className="flex flex-wrap gap-3 justify-center items-center">
                  <div className="relative">
                    {xrayMode && (
                      <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-30 rounded bg-blue-600/90 text-white font-mono text-[9px] px-1.5 py-0.5 whitespace-nowrap pointer-events-none">
                        --color-background-primary-default
                      </span>
                    )}
                    <Button variant="primary" disabled={pinnedState === "disabled"}>
                      Primary
                    </Button>
                  </div>

                  <Button variant="outline" disabled={pinnedState === "disabled"}>
                    Outline
                  </Button>

                  <Button variant="destructive" disabled={pinnedState === "disabled"}>
                    Destructive
                  </Button>
                </div>

                <div className="flex flex-wrap gap-2 justify-center items-center">
                  <Button variant="secondary" disabled={pinnedState === "disabled"}>
                    Secondary
                  </Button>
                  <Button variant="ghost" disabled={pinnedState === "disabled"}>
                    Ghost
                  </Button>
                  <Button variant="link" disabled={pinnedState === "disabled"}>
                    Link
                  </Button>
                </div>
              </div>
            )}

            {/* 3. FormField View */}
            {activeComponent === "form-field" && (
              <div className="w-full max-w-sm flex flex-col gap-4">
                <FormField
                  label="System Identifier"
                  placeholder="e.g. k8s-eu-central-1"
                  defaultValue="k8s-prod-cluster-01"
                  disabled={pinnedState === "disabled"}
                />

                <FormField
                  label="Access Key Secret"
                  type="password"
                  placeholder="••••••••••••••••"
                  defaultValue="secret-token-value"
                  error={pinnedState === "focus" ? undefined : "Key expires in 2 hours."}
                  disabled={pinnedState === "disabled"}
                />
              </div>
            )}

            {/* 4. LoginPage View */}
            {activeComponent === "login-page" && (
              <div className="w-full max-w-sm">
                <LoginPage
                  onSubmit={({ email }) => {
                    alert(`SSO invoked for: ${email}`)
                  }}
                  className="min-h-0 p-0"
                />
              </div>
            )}
          </div>
        </div>

        {/* Right: The Quiet Inspector Panel */}
        <div className="lg:col-span-4 rounded-xl border border-border/70 bg-card p-6 flex flex-col gap-6">
          {/* Header */}
          <div className="border-b border-border/60 pb-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground font-mono">
              Inspector
            </h3>
          </div>

          {/* Simulated States */}
          <div>
            <span className="text-xs text-muted-foreground block mb-2">Simulate State</span>
            <div className="grid grid-cols-2 gap-1.5 font-mono text-xs">
              {[
                { id: "default", label: ":default" },
                { id: "hover", label: ":hover" },
                { id: "focus", label: ":focus-visible" },
                { id: "disabled", label: ":disabled" },
              ].map((s) => (
                <button
                  key={s.id}
                  onClick={() => setPinnedState(s.id as PinnedState)}
                  className={`rounded border px-2.5 py-1.5 text-left transition-colors ${
                    pinnedState === s.id
                      ? "border-foreground/30 bg-muted text-foreground font-medium"
                      : "border-border/60 text-muted-foreground hover:text-foreground hover:bg-muted/30"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tokens */}
          <div className="border-t border-border/60 pt-4">
            <span className="text-xs text-muted-foreground block mb-2">Active Tokens</span>
            <div className="space-y-1 font-mono text-xs">
              <div className="flex items-center justify-between py-1 text-muted-foreground">
                <span className="text-foreground">--color-card</span>
                <span className="text-[11px]">surface.panel</span>
              </div>
              <div className="flex items-center justify-between py-1 text-muted-foreground">
                <span className="text-foreground">--color-primary</span>
                <span className="text-[11px]">action.primary</span>
              </div>
              <div className="flex items-center justify-between py-1 text-muted-foreground">
                <span className="text-foreground">--space-component-md</span>
                <span className="text-[11px]">16px on-grid</span>
              </div>
              <div className="flex items-center justify-between py-1 text-muted-foreground">
                <span className="text-foreground">--radii-md</span>
                <span className="text-[11px]">6px radius</span>
              </div>
            </div>
          </div>

          {/* Quiet Status */}
          <div className="border-t border-border/60 pt-4 font-mono text-xs text-muted-foreground space-y-1.5">
            <div className="flex items-center justify-between">
              <span>Token Compliance</span>
              <span className="text-emerald-500">100% W3C DTCG</span>
            </div>
            <div className="flex items-center justify-between">
              <span>WCAG Contrast</span>
              <span className="text-emerald-500">AAA Compliant</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Engine</span>
              <span>A2UI Ready</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
