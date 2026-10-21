import {
  Layers,
  Cpu,
  Braces,
  FileCode,
  Sun,
  Moon,
  Crosshair,
} from "lucide-react"

import { useShowcase, type ShowcaseTab } from "./ShowcaseContext"
import { WorkbenchView } from "./WorkbenchView"
import { AgenticLabView } from "./AgenticLabView"
import { TokenView } from "./TokenView"
import { SpecsView } from "./SpecsView"

export function AppShell() {
  const { activeTab, setActiveTab, theme, toggleTheme, xrayMode, toggleXray } = useShowcase()

  const tabs: { id: ShowcaseTab; label: string; icon: typeof Layers }[] = [
    { id: "workbench", label: "Workbench", icon: Layers },
    { id: "agentic-lab", label: "Agentic Lab", icon: Cpu },
    { id: "tokens", label: "Tokens", icon: Braces },
    { id: "specs", label: "Specs", icon: FileCode },
  ]

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans transition-colors duration-150">
      {/* Calm, Minimal Header */}
      <header className="border-b border-border/80 bg-background/95 sticky top-0 z-50 backdrop-blur-xs">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
          {/* Logo: Understated & Clean */}
          <div className="flex items-baseline gap-2">
            <span className="font-semibold text-sm tracking-tight text-foreground">
              Agentic DS
            </span>
            <span className="text-xs text-muted-foreground font-normal">
              by Andreas Keim
            </span>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden sm:flex items-center gap-1">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`rounded-md px-3 py-1.5 text-xs transition-colors ${
                    isActive
                      ? "bg-muted text-foreground font-medium"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                  }`}
                >
                  {tab.label}
                </button>
              )
            })}
          </nav>

          {/* Right Controls: X-Ray, Theme, GitHub */}
          <div className="flex items-center gap-2">
            {/* Token X-Ray Toggle */}
            <button
              onClick={toggleXray}
              className={`flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-mono transition-all ${
                xrayMode
                  ? "border-blue-500/60 bg-blue-500/10 text-blue-500 font-medium"
                  : "border-border/80 text-muted-foreground hover:text-foreground hover:bg-muted/30"
              }`}
              title="Token X-Ray"
            >
              <Crosshair className="h-3 w-3" />
              <span>X-Ray: {xrayMode ? "ON" : "OFF"}</span>
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="rounded-md border border-border/80 p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors"
              title={`Switch to ${theme === "dark" ? "Light" : "Dark"} Mode`}
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
            </button>

            {/* GitHub Link */}
            <a
              href="https://github.com/andreas-keim/agentic-design-system-playground"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-md border border-border/80 p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors"
              title="GitHub Repository"
            >
              <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
            </a>
          </div>
        </div>

        {/* Mobile Nav */}
        <div className="flex sm:hidden border-t border-border/80 px-4 py-1.5 gap-1 bg-muted/10">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`rounded px-2.5 py-1 text-xs transition-colors ${
                activeTab === tab.id ? "bg-muted text-foreground font-medium" : "text-muted-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1">
        {activeTab === "workbench" && <WorkbenchView />}
        {activeTab === "agentic-lab" && <AgenticLabView />}
        {activeTab === "tokens" && <TokenView />}
        {activeTab === "specs" && <SpecsView />}
      </main>

      {/* Quiet, Minimal Footer */}
      <footer className="border-t border-border/60 py-4 px-6 text-xs text-muted-foreground">
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Agentic Design System • W3C DTCG Tokens & A2UI Engine</span>
          <span>100% Client-Side • Vercel</span>
        </div>
      </footer>
    </div>
  )
}
