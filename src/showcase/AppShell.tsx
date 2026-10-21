import {
  Layers,
  Cpu,
  Braces,
  FileCode,
  Sun,
  Moon,
  Crosshair,
  CheckCircle2,
  ExternalLink,
} from "lucide-react"

import { useShowcase, type ShowcaseTab } from "./ShowcaseContext"
import { WorkbenchView } from "./WorkbenchView"
import { AgenticLabView } from "./AgenticLabView"
import { TokenView } from "./TokenView"
import { SpecsView } from "./SpecsView"

export function AppShell() {
  const { activeTab, setActiveTab, theme, toggleTheme, xrayMode, toggleXray } = useShowcase()

  const tabs: { id: ShowcaseTab; label: string; icon: typeof Layers; badge?: string }[] = [
    { id: "workbench", label: "1. Workbench", icon: Layers },
    { id: "agentic-lab", label: "2. Agentic Lab", icon: Cpu, badge: "A2UI" },
    { id: "tokens", label: "3. W3C Tokens", icon: Braces },
    { id: "specs", label: "4. Architecture", icon: FileCode },
  ]

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans transition-colors duration-200">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          {/* Logo & Identity */}
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-mono font-bold text-xs shadow-sm">
              DS
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm tracking-tight text-foreground">
                  AGENTIC DS
                </span>
                <span className="hidden sm:inline-block text-xs font-mono text-muted-foreground">
                  // Andreas Keim
                </span>
              </div>
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-mono">
                Staff Design Engineering Showcase
              </span>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1 rounded-lg border border-border bg-muted/40 p-1">
            {tabs.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
                    isActive
                      ? "bg-background text-foreground shadow-xs font-semibold"
                      : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <span className="rounded bg-primary/10 text-primary px-1.5 py-0.2 text-[9px] font-mono font-bold">
                      {tab.badge}
                    </span>
                  )}
                </button>
              )
            })}
          </nav>

          {/* Right Controls: X-Ray, Theme, GitHub */}
          <div className="flex items-center gap-2">
            {/* Token X-Ray Toggle */}
            <button
              onClick={toggleXray}
              className={`flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs font-mono transition-all ${
                xrayMode
                  ? "border-blue-500 bg-blue-500/10 text-blue-500 font-bold shadow-xs ring-1 ring-blue-500/50"
                  : "border-border bg-background text-muted-foreground hover:text-foreground hover:bg-muted/40"
              }`}
              title="Toggle Token X-Ray Mode (Inspect semantic design tokens on hover)"
            >
              <Crosshair className={`h-3.5 w-3.5 ${xrayMode ? "animate-pulse" : ""}`} />
              <span className="hidden sm:inline">Token X-Ray:</span>
              <span>{xrayMode ? "ON" : "OFF"}</span>
            </button>

            {/* Theme Switcher */}
            <button
              onClick={toggleTheme}
              className="rounded-md border border-border bg-background p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors"
              title={`Switch to ${theme === "dark" ? "Light" : "Dark"} Mode`}
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            {/* GitHub Link */}
            <a
              href="https://github.com/andreas-keim/agentic-design-system-playground"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-md border border-border bg-background p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors"
              title="View on GitHub"
            >
              <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
            </a>
          </div>
        </div>

        {/* Mobile Navigation Bar */}
        <div className="flex md:hidden border-t border-border px-3 py-1.5 overflow-x-auto gap-1 bg-muted/20">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex shrink-0 items-center gap-1.5 rounded px-2.5 py-1 text-xs font-medium ${
                  isActive ? "bg-background text-foreground font-semibold shadow-xs" : "text-muted-foreground"
                }`}
              >
                <Icon className="h-3 w-3" />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>
      </header>

      {/* System Status Indicator Bar (Hero Strip) */}
      <div className="border-b border-border bg-muted/20 px-4 py-2 font-mono text-[11px] text-muted-foreground">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-1.5 text-emerald-500 font-medium">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              W3C DTCG v1.0
            </span>
            <span className="text-border">|</span>
            <span>6 Core Components</span>
            <span className="text-border">|</span>
            <span>Domain: Enterprise B2B</span>
            <span className="text-border">|</span>
            <span className="inline-flex items-center gap-1 text-foreground font-medium">
              <CheckCircle2 className="h-3 w-3 text-emerald-500" />
              A2UI Validator: PASS (100% Strict)
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-2">
            <span className="text-[10px] text-muted-foreground">React 19 • Tailwind v4 • Vercel Edge</span>
            <span className="text-border">|</span>
            <a
              href="https://vercel.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground"
            >
              0.00 € Hosting
              <ExternalLink className="h-2.5 w-2.5" />
            </a>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1">
        {activeTab === "workbench" && <WorkbenchView />}
        {activeTab === "agentic-lab" && <AgenticLabView />}
        {activeTab === "tokens" && <TokenView />}
        {activeTab === "specs" && <SpecsView />}
      </main>

      {/* Precision Footer */}
      <footer className="border-t border-border bg-muted/10 py-6 px-4 text-xs text-muted-foreground font-mono">
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div>
            Built with W3C Design Tokens, React 19 & Style Dictionary by{" "}
            <a
              href="https://linkedin.com/in/andreas-keim-ux"
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground font-medium underline underline-offset-2 hover:text-primary"
            >
              Andreas Keim
            </a>
          </div>
          <div className="text-[11px]">
            100% NDA-free Proof of Work • Zero Server Dependencies • Vercel Hobby Tier
          </div>
        </div>
      </footer>
    </div>
  )
}
