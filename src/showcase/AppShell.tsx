import { Sun, Moon, Crosshair } from "lucide-react"

import { useShowcase, type ShowcaseTab } from "./ShowcaseContext"
import { WorkbenchView } from "./WorkbenchView"
import { AgenticLabView } from "./AgenticLabView"
import { TokenView } from "./TokenView"
import { SpecsView } from "./SpecsView"

export function AppShell() {
  const { activeTab, setActiveTab, theme, toggleTheme, xrayMode, toggleXray } = useShowcase()

  const navItems: { id: ShowcaseTab; label: string }[] = [
    { id: "workbench", label: "Workbench" },
    { id: "agentic-lab", label: "Agentic Lab" },
    { id: "tokens", label: "W3C Tokens" },
    { id: "specs", label: "Architecture Specs" },
  ]

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans antialiased selection:bg-foreground selection:text-background">
      {/* Apple-Style Navigation Bar: 44px (h-11), Pure White, No Border */}
      <header className="sticky top-0 z-50 h-11 w-full bg-white dark:bg-card transition-colors">
        <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-6">
          {/* Left: Distinct Brand Mark & Identity */}
          <div className="flex items-center gap-2.5">
            {/* Custom Geometric Token Icon */}
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-foreground text-background transition-transform hover:scale-105 shadow-2xs">
              <svg
                className="h-3.5 w-3.5 fill-current"
                viewBox="0 0 24 24"
              >
                {/* Isometric Token Node / Faceted Cube */}
                <path d="M12 2L4 7v10l8 5 8-5V7l-8-5zm0 2.4l5.6 3.5L12 11.4 6.4 7.9 12 4.4zM6 9.6l5 3.1v6.2l-5-3.1V9.6zm12 0v6.2l-5 3.1v-6.2l5-3.1z" />
              </svg>
            </div>

            <div className="flex items-baseline gap-1.5">
              <span className="font-semibold text-xs tracking-tight text-foreground">
                Agentic DS
              </span>
              <span className="hidden md:inline text-[11px] text-muted-foreground font-normal">
                by Andreas Keim
              </span>
            </div>
          </div>

          {/* Center: Apple-style Text Navigation */}
          <nav className="hidden sm:flex items-center gap-6">
            {navItems.map((item) => {
              const isActive = activeTab === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`text-[12px] tracking-tight transition-colors ${
                    isActive
                      ? "text-foreground font-medium"
                      : "text-muted-foreground/80 hover:text-foreground"
                  }`}
                >
                  {item.label}
                </button>
              )
            })}
          </nav>

          {/* Right Controls: X-Ray, Theme, GitHub */}
          <div className="flex items-center gap-1.5">
            {/* Token X-Ray Toggle */}
            <button
              onClick={toggleXray}
              className={`flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-mono transition-all ${
                xrayMode
                  ? "bg-blue-600 text-white font-medium shadow-xs"
                  : "bg-muted/60 text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
              title="Toggle Token X-Ray"
            >
              <Crosshair className="h-3 w-3" />
              <span>X-Ray</span>
            </button>

            {/* Theme Switcher */}
            <button
              onClick={toggleTheme}
              className="rounded-full p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
              title={`Switch to ${theme === "dark" ? "Light" : "Dark"} Mode`}
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
            </button>

            {/* GitHub */}
            <a
              href="https://github.com/andreas-keim/agentic-design-system-playground"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
              title="GitHub Repository"
            >
              <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
            </a>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="flex sm:hidden px-4 py-1.5 gap-3 bg-white dark:bg-card overflow-x-auto">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`shrink-0 text-[11px] tracking-tight ${
                activeTab === item.id ? "text-foreground font-medium" : "text-muted-foreground"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </header>

      {/* Main Content Viewport */}
      <main className="flex-1">
        {activeTab === "workbench" && <WorkbenchView />}
        {activeTab === "agentic-lab" && <AgenticLabView />}
        {activeTab === "tokens" && <TokenView />}
        {activeTab === "specs" && <SpecsView />}
      </main>

      {/* Minimal Apple-Style Footer */}
      <footer className="border-t border-border/60 py-6 px-6 text-[11px] text-muted-foreground">
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Agentic Design System • Built with W3C DTCG Tokens & React 19 by Andreas Keim</span>
          <span>100% Client-Side • Deployed on Vercel</span>
        </div>
      </footer>
    </div>
  )
}
