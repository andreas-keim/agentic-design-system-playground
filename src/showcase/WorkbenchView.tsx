import { useState } from "react"
import {
  Sliders,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
} from "lucide-react"

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
    setRecordSavedNotice(`Saved record at ${new Date().toLocaleTimeString()}`)
    setTimeout(() => setRecordSavedNotice(null), 3000)
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      {/* Workbench Layout: Split Screen */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Pane: Interactive Component Stage (65% on Desktop) */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          {/* Stage Control Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card px-4 py-3 shadow-xs">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-medium text-muted-foreground uppercase">
                Active Component:
              </span>
              <div className="flex items-center gap-1">
                {[
                  { id: "edit-panel", label: "EditEntryPanel (Record Config)" },
                  { id: "button", label: "Button Variants" },
                  { id: "form-field", label: "FormField & Input" },
                  { id: "login-page", label: "Enterprise SSO" },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveComponent(item.id as ActiveComponent)}
                    className={`rounded-md px-2.5 py-1 text-xs font-mono transition-colors ${
                      activeComponent === item.id
                        ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                        : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
              <span>Viewport: Desktop</span>
              <span>•</span>
              <span>Grid: 8px W3C Scale</span>
            </div>
          </div>

          {/* Canvas / Stage Area */}
          <div
            className={`relative min-h-[460px] rounded-xl border border-border bg-card/60 p-8 flex flex-col items-center justify-center shadow-xs overflow-hidden transition-all ${
              xrayMode ? "ring-2 ring-blue-500/20 bg-blue-950/[0.02]" : ""
            }`}
          >
            {/* Background Grid Pattern */}
            <div
              className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none"
              style={{
                backgroundImage: `radial-gradient(currentColor 1px, transparent 1px)`,
                backgroundSize: "16px 16px",
              }}
            />

            {/* X-Ray Indicator Overlay Badge */}
            {xrayMode && (
              <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5 rounded-md bg-blue-500/10 border border-blue-500/30 px-2 py-1 font-mono text-[10px] text-blue-500 font-semibold backdrop-blur-xs">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-ping" />
                TOKEN X-RAY ACTIVE // HOVER TO INSPECT BLUEPRINT
              </div>
            )}

            {/* Saved Notification Banner */}
            {recordSavedNotice && (
              <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5 rounded-md bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 font-mono text-xs text-emerald-500 animate-fadeIn">
                <CheckCircle2 className="h-3.5 w-3.5" />
                {recordSavedNotice}
              </div>
            )}

            {/* Render Target: EditEntryPanel */}
            {activeComponent === "edit-panel" && (
              <div className="w-full max-w-lg z-10">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">
                    Enterprise Pattern // Record Management
                  </span>
                  <span className="text-[11px] font-mono text-emerald-500 font-medium">
                    100% Token Compliant
                  </span>
                </div>

                {systemRecord === null ? (
                  <div className="rounded-lg border border-dashed border-border p-8 text-center bg-card">
                    <p className="text-sm text-muted-foreground mb-3">System record deleted.</p>
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
                  <div className="relative group">
                    {xrayMode && (
                      <span className="absolute -top-3 right-2 z-30 rounded bg-blue-600 text-white font-mono text-[9px] px-1.5 py-0.5 shadow-xs pointer-events-none">
                        var(--color-card) + var(--space-component-md)
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

            {/* Render Target: Button Showcase */}
            {activeComponent === "button" && (
              <div className="flex flex-col gap-6 items-center z-10 w-full max-w-md">
                <div className="flex flex-wrap gap-3 justify-center">
                  <div className="relative group">
                    {xrayMode && (
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 z-30 rounded bg-blue-600 text-white font-mono text-[9px] px-1.5 py-0.5 shadow-xs whitespace-nowrap pointer-events-none">
                        --color-background-primary-default
                      </span>
                    )}
                    <Button variant="primary" disabled={pinnedState === "disabled"}>
                      Primary Button
                    </Button>
                  </div>

                  <Button variant="outline" disabled={pinnedState === "disabled"}>
                    Outline Button
                  </Button>

                  <Button variant="destructive" disabled={pinnedState === "disabled"}>
                    Destructive Action
                  </Button>
                </div>

                <div className="flex flex-wrap gap-3 justify-center">
                  <Button variant="secondary" disabled={pinnedState === "disabled"}>
                    Secondary
                  </Button>
                  <Button variant="ghost" disabled={pinnedState === "disabled"}>
                    Ghost Button
                  </Button>
                  <Button variant="link" disabled={pinnedState === "disabled"}>
                    Link Style
                  </Button>
                </div>
              </div>
            )}

            {/* Render Target: FormField & Input */}
            {activeComponent === "form-field" && (
              <div className="w-full max-w-sm flex flex-col gap-4 z-10">
                <FormField
                  label="Cluster Identifier"
                  placeholder="e.g. k8s-eu-central-1"
                  defaultValue="k8s-prod-cluster-01"
                  disabled={pinnedState === "disabled"}
                />

                <FormField
                  label="API Token Access Secret"
                  type="password"
                  placeholder="••••••••••••••••"
                  defaultValue="secret-token-value"
                  error={pinnedState === "focus" ? undefined : "Token expires in 2 hours."}
                  disabled={pinnedState === "disabled"}
                />
              </div>
            )}

            {/* Render Target: LoginPage */}
            {activeComponent === "login-page" && (
              <div className="w-full max-w-md z-10 rounded-lg border border-border bg-card p-6 shadow-sm">
                <LoginPage
                  onSubmit={({ email }) => {
                    alert(`SSO Authentication invoked for: ${email}`)
                  }}
                  className="min-h-0 p-0"
                />
              </div>
            )}
          </div>
        </div>

        {/* Right Pane: Live Inspector & Diagnostics Panel (35% on Desktop) */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          {/* Inspector Header */}
          <div className="rounded-xl border border-border bg-card p-5 shadow-xs flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <Sliders className="h-4 w-4 text-primary" />
                <h3 className="font-bold text-sm text-foreground">Component Inspector</h3>
              </div>
              <span className="font-mono text-[10px] text-muted-foreground uppercase bg-muted px-2 py-0.5 rounded">
                Live State
              </span>
            </div>

            {/* State Pinning Controls */}
            <div>
              <label className="text-xs font-mono text-muted-foreground block mb-2 uppercase tracking-wider">
                Simulated Pseudo-State:
              </label>
              <div className="grid grid-cols-2 gap-2 font-mono text-xs">
                {[
                  { id: "default", label: ":default" },
                  { id: "hover", label: ":hover" },
                  { id: "focus", label: ":focus-visible" },
                  { id: "disabled", label: ":disabled" },
                ].map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setPinnedState(s.id as PinnedState)}
                    className={`rounded-md border px-2.5 py-1.5 text-left transition-colors flex items-center justify-between ${
                      pinnedState === s.id
                        ? "border-primary bg-primary/10 text-primary font-bold shadow-xs"
                        : "border-border bg-background text-muted-foreground hover:text-foreground hover:bg-muted/40"
                    }`}
                  >
                    <span>{s.label}</span>
                    {pinnedState === s.id && <CheckCircle2 className="h-3 w-3" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Consumed W3C Semantic Tokens */}
            <div className="border-t border-border pt-4">
              <label className="text-xs font-mono text-muted-foreground block mb-2 uppercase tracking-wider flex items-center justify-between">
                <span>Active W3C Tokens:</span>
                <span className="text-[10px] text-blue-500 font-semibold">Strict DTCG</span>
              </label>
              <div className="space-y-1.5 font-mono text-[11px]">
                <div className="flex items-center justify-between rounded bg-muted/40 px-2 py-1">
                  <span className="text-foreground">--color-card</span>
                  <span className="text-muted-foreground text-[10px]">surface.panel</span>
                </div>
                <div className="flex items-center justify-between rounded bg-muted/40 px-2 py-1">
                  <span className="text-foreground">--color-primary</span>
                  <span className="text-blue-500 text-[10px]">#2563eb (brand)</span>
                </div>
                <div className="flex items-center justify-between rounded bg-muted/40 px-2 py-1">
                  <span className="text-foreground">--space-component-md</span>
                  <span className="text-muted-foreground text-[10px]">16px on-grid</span>
                </div>
                <div className="flex items-center justify-between rounded bg-muted/40 px-2 py-1">
                  <span className="text-foreground">--radii-md</span>
                  <span className="text-muted-foreground text-[10px]">6px border-radius</span>
                </div>
              </div>
            </div>

            {/* Deterministic Guardrail Status (check.ts) */}
            <div className="border-t border-border pt-4">
              <label className="text-xs font-mono text-muted-foreground block mb-2 uppercase tracking-wider">
                Automated Guardrail Audit:
              </label>
              <div className="space-y-2 font-mono text-xs">
                <div className="flex items-center justify-between text-emerald-500 font-medium">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Token Strictness
                  </span>
                  <span>100% Strict</span>
                </div>
                <div className="flex items-center justify-between text-emerald-500 font-medium">
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    WCAG 2.1 APCA Contrast
                  </span>
                  <span>AAA Verified</span>
                </div>
                <div className="flex items-center justify-between text-emerald-500 font-medium">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5" />
                    Agent Catalog Compliance
                  </span>
                  <span>Valid Contract</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
