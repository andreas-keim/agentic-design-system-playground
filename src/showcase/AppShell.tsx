import { Sun, Moon } from "lucide-react"

import { useShowcase, type ShowcaseTab } from "./ShowcaseContext"
import { WorkbenchView } from "./WorkbenchView"
import { AgenticLabView } from "./AgenticLabView"
import { TokenView } from "./TokenView"
import { SpecsView } from "./SpecsView"

export function AppShell() {
  const { activeTab, setActiveTab, theme, toggleTheme } = useShowcase()

  const navItems: { id: ShowcaseTab; label: string }[] = [
    { id: "workbench", label: "Workbench" },
    { id: "agentic-lab", label: "Agentic Lab" },
    { id: "tokens", label: "W3C Tokens" },
    { id: "specs", label: "Architecture Specs" },
  ]

  function handleNavTab(tabId: ShowcaseTab) {
    if (window.location.hash) {
      history.replaceState(null, "", window.location.pathname + window.location.search)
    }
    setActiveTab(tabId)
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans antialiased selection:bg-foreground selection:text-background">
      {/* Clean Navigation Bar: Height adapts to content on mobile/tablet, single-row on desktop (lg:) */}
      <header className="sticky top-0 z-50 w-full bg-white dark:bg-card/85 dark:backdrop-blur-xl border-b border-border/60 dark:border-border/80 dark:shadow-sm dark:shadow-black/40 transition-colors">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
          {/* Left: Distinct Brand Mark & Identity */}
          <button
            onClick={() => handleNavTab("workbench")}
            className="flex items-center gap-3 text-left group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded-md py-1 transition-opacity hover:opacity-85 cursor-pointer shrink-0"
            title="Go to Home / Workbench"
          >
            {/* Geometric Token Icon */}
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-foreground text-background shadow-xs group-hover:scale-105 transition-transform shrink-0">
              <svg
                className="h-4 w-4 fill-current"
                viewBox="0 0 24 24"
              >
                <path d="M12 2L4 7v10l8 5 8-5V7l-8-5zm0 2.4l5.6 3.5L12 11.4 6.4 7.9 12 4.4zM6 9.6l5 3.1v6.2l-5-3.1V9.6zm12 0v6.2l-5 3.1v-6.2l5-3.1z" />
              </svg>
            </div>

            <div className="flex flex-col justify-center">
              <span className="font-semibold text-sm tracking-tight text-foreground leading-tight">
                Agentic DS
              </span>
              <span className="text-[11px] text-muted-foreground font-normal leading-tight">
                by Andreas Keim
              </span>
            </div>
          </button>

          {/* Center: Desktop Navigation Links (shown only at lg: when logo, links & controls truly fit side-by-side) */}
          <nav className="hidden lg:flex items-center gap-7" aria-label="Hauptnavigation">
            {navItems.map((item) => {
              const isActive = activeTab === item.id
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNavTab(item.id)}
                  aria-current={isActive ? "page" : undefined}
                  className={`text-[13px] tracking-tight transition-colors cursor-pointer rounded-sm py-0.5 px-1 -mx-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
                    isActive
                      ? "text-foreground font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {item.label}
                </button>
              )
            })}
          </nav>

          {/* Right Controls: Theme, LinkedIn, GitHub */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Theme Switcher */}
            <button
              type="button"
              onClick={toggleTheme}
              className="rounded-full p-2 text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              title={`Switch to ${theme === "dark" ? "Light" : "Dark"} Mode`}
              aria-label={theme === "dark" ? "Zu hellem Farbmodus wechseln" : "Zu dunklem Farbmodus wechseln"}
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            {/* LinkedIn */}
            <a
              href="https://www.linkedin.com/in/akeimux/"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              title="LinkedIn Profile"
              aria-label="LinkedIn Profil von Andreas Keim"
            >
              <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.45a1.64 1.64 0 1 0 0 3.28 1.64 1.64 0 0 0 0-3.28" />
              </svg>
            </a>

            {/* GitHub */}
            <a
              href="https://github.com/andreas-keim/agentic-design-system-playground"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              title="GitHub Repository"
              aria-label="GitHub Repository des Playgrounds"
            >
              <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
            </a>
          </div>
        </div>

        {/* Mobile / Tablet Navigation: Refined segmented pill strip below lg */}
        <nav
          aria-label="Mobile Navigation"
          className="flex lg:hidden px-4 sm:px-6 py-2 gap-1.5 border-t border-border/40 overflow-x-auto scrollbar-none items-center"
        >
          {navItems.map((item) => {
            const isActive = activeTab === item.id
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavTab(item.id)}
                aria-current={isActive ? "page" : undefined}
                className={`shrink-0 text-xs tracking-tight transition-all cursor-pointer py-1.5 px-3 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
                  isActive
                    ? "bg-foreground text-background font-semibold shadow-xs"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                }`}
              >
                {item.label}
              </button>
            )
          })}
        </nav>
      </header>

      {/* Main Content Viewport */}
      <main className="flex-1">
        {activeTab === "workbench" && <WorkbenchView />}
        {activeTab === "agentic-lab" && <AgenticLabView />}
        {activeTab === "tokens" && <TokenView />}
        {activeTab === "specs" && <SpecsView />}
      </main>
    </div>
  )
}
