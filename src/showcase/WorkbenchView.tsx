import { useState } from "react"
import { CheckCircle2, ArrowRight } from "lucide-react"

import { useShowcase } from "./ShowcaseContext"
import { PageHeader } from "./PageHeader"
import { SegmentedTabs } from "./SegmentedTabs"
import { Button } from "@/components/ui/button"
import { FormField } from "@/components/ui/form-field"
import { EditEntryPanel } from "@/components/edit-entry-panel"
import { LoginPage } from "@/components/login-page"

type ActiveComponent = "edit-panel" | "button" | "form-field" | "login-page"

interface DesignRule {
  label: string
  description: string
}

interface ViewInspectionData {
  rules: DesignRule[]
}

const INSPECTION_DATA: Record<ActiveComponent, ViewInspectionData> = {
  "edit-panel": {
    rules: [
      {
        label: "Alles gehört zusammen",
        description:
          "Eingabe und zugehörige Aktionen stehen auf einer gemeinsamen Fläche. So bleibt klar, worauf sich ‚Speichern‘ und ‚Löschen‘ beziehen.",
      },
      {
        label: "Feste Abstandsregeln",
        description:
          "Abstände und Innenräume folgen einem einheitlichen Raster. Das sorgt für visuelle Ruhe und verlässliche Proportionen.",
      },
      {
        label: "Klare Aktionsführung",
        description:
          "Die Hauptaktion zum Speichern führt den Blick, während riskante Schritte wie das Löschen deutlich abgesetzt sind.",
      },
    ],
  },
  button: {
    rules: [
      {
        label: "Eindeutige Hierarchie",
        description:
          "Nur die wichtigste Aktion im Ablauf erhält die kräftige Primärfarbe. Sekundäre Optionen treten optisch zurück.",
      },
      {
        label: "Verlässliche Barrierefreiheit",
        description:
          "Alle Beschriftungen und Signalfarben erfüllen strenge Kontrastanforderungen für helle und dunkle Darstellungen.",
      },
      {
        label: "Einheitliche Geometrie",
        description:
          "Gleiche Rundungen, Innenabstände und Schriftgrößen verbinden alle Varianten zu einer wiedererkennbaren Familie.",
      },
    ],
  },
  "form-field": {
    rules: [
      {
        label: "Klare Leseführung",
        description:
          "Feldbezeichnungen und Hinweistexte sind typografisch klar gestaffelt und bleiben in jeder Situation verständlich.",
      },
      {
        label: "Konsistente Eingabefelder",
        description:
          "Einheitliche Innenabstände und Klickflächen stellen sicher, dass Eingaben auf Desktop und Touchgeräten leicht gelingen.",
      },
      {
        label: "Eindeutige Fehlerzustände",
        description:
          "Probleme werden sofort durch Signalfarben, deutliche Umrandungen und begleitende Hilfetexte hervorgehoben.",
      },
    ],
  },
  "login-page": {
    rules: [
      {
        label: "Fokussierter Zugang",
        description:
          "Das zentrierte Formular bündelt die Anmeldung ohne unnötige Ablenkung auf einer ruhigen Fläche.",
      },
      {
        label: "Klare Leitaktion",
        description:
          "Der Anmelde-Button signalisiert unmissverständlich den nächsten Handlungsschritt.",
      },
      {
        label: "Wiederverwendete Bausteine",
        description:
          "Die Eingabefelder und Buttons stammen aus dem gleichen Baukasten und verhalten sich exakt wie die Einzelkomponenten.",
      },
    ],
  },
}

export function WorkbenchView() {
  const { setActiveTab } = useShowcase()
  const [activeComponent, setActiveComponent] = useState<ActiveComponent>("edit-panel")

  // Sample Enterprise Record Data
  const [systemRecord, setSystemRecord] = useState<string | null>(
    "SYS-REC-84920 (Cluster Security Officer // Level 3 Restricted)"
  )
  const [recordSavedNotice, setRecordSavedNotice] = useState<string | null>(null)

  const inspection = INSPECTION_DATA[activeComponent]

  function handleSaveRecord(value: string) {
    setSystemRecord(value)
    setRecordSavedNotice("Saved")
    setTimeout(() => setRecordSavedNotice(null), 2500)
  }

  function handleCheckButtonColor() {
    window.location.hash = "testfall-03"
    setActiveTab("specs")
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 sm:py-8">
      <PageHeader
        title="Komponenten-Workbench"
        subtitle="Ich habe ein Design System gebaut, das Agenten auf freigegebene Komponenten begrenzt und strukturierte UI-Ausgaben gegen konkrete Regeln prüft."
        action={
          <button
            type="button"
            onClick={handleCheckButtonColor}
            aria-label="Button-Farbe prüfen – Zu Testfall 03 in Architecture Specs wechseln"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground hover:text-primary transition-colors cursor-pointer shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded-sm self-start md:self-end"
          >
            <span>Button-Farbe prüfen</span>
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
        }
      />

      {/* 2-Column Clean Workspace: Exact Top Alignment, 2-Tier Surface Hierarchy */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start lg:items-stretch">
        {/* Left: The Component Stage Card */}
        <div className="lg:col-span-8 rounded-2xl border border-border/80 bg-card shadow-xs flex flex-col overflow-hidden">
          {/* Stage Header / Toolbar: min-h-16 für horizontales Divider-Alignment auf Desktop, umbruchsicher auf Mobile */}
          <div className="flex items-center border-b border-border/60 px-4 sm:px-6 min-h-16 py-3 bg-card shrink-0">
            {/* Apple-Style Segmented Component Selector */}
            <div className="overflow-x-auto scrollbar-none max-w-full py-0.5">
              <SegmentedTabs<ActiveComponent>
                items={[
                  { id: "edit-panel", label: "Record Panel" },
                  { id: "button", label: "Button Variants" },
                  { id: "form-field", label: "Form Fields" },
                  { id: "login-page", label: "SSO Login" },
                ]}
                value={activeComponent}
                onChange={setActiveComponent}
              />
            </div>
          </div>

          {/* The Viewport Canvas (Subtle Recessed Surface where the Object Lives) */}
          <div className="relative flex-1 p-4 sm:p-8 lg:p-12 flex items-center justify-center bg-muted/25 dark:bg-muted/10">
            {/* Subtle Saved Toast */}
            {recordSavedNotice && (
              <div className="absolute top-4 right-4 z-20 flex items-center gap-1.5 rounded-full bg-card border border-border/80 px-3 py-1 text-xs text-foreground font-mono shadow-xs">
                <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                {recordSavedNotice}
              </div>
            )}

            {/* 1. EditEntryPanel View: Pure White Card with Real Elevation */}
            {activeComponent === "edit-panel" && (
              <div className="w-full max-w-lg">
                {systemRecord === null ? (
                  <div className="rounded-xl border border-dashed border-border/80 bg-card p-8 text-center shadow-xs">
                    <p className="text-xs text-muted-foreground mb-3">Record removed from cluster.</p>
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
                  <EditEntryPanel
                    value={systemRecord}
                    onSave={handleSaveRecord}
                    onCancel={() => {}}
                    onDelete={() => setSystemRecord(null)}
                    title="System Access & Role Configuration"
                    inputLabel="Record Identifier & Clearance Level"
                    deleteLabel="Delete Record"
                    cancelLabel="Cancel"
                    saveLabel="Save Changes"
                  />
                )}
              </div>
            )}

            {/* 2. Button View: Floating cleanly on the Canvas */}
            {activeComponent === "button" && (
              <div className="flex flex-col gap-6 items-center w-full max-w-md bg-card p-8 rounded-xl border border-border/80 shadow-xs">
                <div className="flex flex-wrap gap-3 justify-center items-center w-full">
                  <Button variant="primary">
                    Primary
                  </Button>

                  <Button variant="outline">
                    Outline
                  </Button>

                  <Button variant="destructive">
                    Destructive
                  </Button>
                </div>

                <div className="w-full border-t border-border/50" />

                <div className="flex flex-wrap gap-2 justify-center items-center w-full">
                  <Button variant="secondary">
                    Secondary
                  </Button>
                  <Button variant="ghost">
                    Ghost
                  </Button>
                  <Button variant="link">
                    Link
                  </Button>
                </div>
              </div>
            )}

            {/* 3. FormField View */}
            {activeComponent === "form-field" && (
              <div className="w-full max-w-sm flex flex-col gap-4 bg-card p-6 rounded-xl border border-border/80 shadow-xs">
                <FormField
                  label="System Identifier"
                  placeholder="e.g. k8s-eu-central-1"
                  defaultValue="k8s-prod-cluster-01"
                />

                <FormField
                  label="Access Key Secret"
                  type="password"
                  placeholder="••••••••••••••••"
                  defaultValue="secret-token-value"
                  error="Key expires in 2 hours."
                />
              </div>
            )}

            {/* 4. LoginPage View */}
            {activeComponent === "login-page" && (
              <div className="w-full max-w-sm bg-card p-8 rounded-2xl border border-border/90 shadow-sm">
                <LoginPage
                  onSubmit={({ email }) => {
                    alert(`SSO invoked for: ${email}`)
                  }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Right: The Quiet Inspector Panel Card */}
        <div className="lg:col-span-4 rounded-2xl border border-border/80 bg-card overflow-hidden shadow-xs flex flex-col">
          {/* Header: Bündig mit linker Stage-Toolbar */}
          <div className="border-b border-border/60 px-4 sm:px-6 min-h-16 py-3 flex flex-col justify-center bg-card shrink-0">
            <h3 className="text-base font-semibold tracking-tight text-foreground leading-tight">
              Component Inspector
            </h3>
            <p className="text-sm text-muted-foreground leading-normal mt-0.5">
              Design-Regeln & Governance-Belege
            </p>
          </div>

          <div className="p-4 sm:p-6 flex-1 flex flex-col justify-between">
            {/* 1. Design-Regeln dieser Ansicht (verständlich für Recruiter / Stakeholder) */}
            <div>
              <span className="text-xs font-mono text-muted-foreground block mb-3 uppercase tracking-wider">
                Design-Regeln dieser Ansicht
              </span>
              <div className="space-y-4">
                {inspection.rules.map((rule, idx) => (
                  <div key={idx}>
                    <h4 className="block text-sm font-semibold text-foreground tracking-tight">
                      {rule.label}
                    </h4>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      {rule.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. Dezent gestalteter Textlink zu den technischen Token-Details */}
            <div className="border-t border-border/60 pt-4 mt-5">
              <button
                type="button"
                onClick={() => setActiveTab("tokens")}
                className="inline-flex items-center gap-1.5 text-sm font-medium font-sans text-muted-foreground hover:text-foreground transition-colors cursor-pointer group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded-sm"
              >
                <span>Technische Token-Details ansehen</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
