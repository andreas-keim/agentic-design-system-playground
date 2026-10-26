import React, { createContext, useContext, useEffect, useState } from "react"

export type ShowcaseTab = "workbench" | "agentic-lab" | "tokens" | "specs"
export type ThemeMode = "light" | "dark"

interface ShowcaseContextValue {
  activeTab: ShowcaseTab
  setActiveTab: (tab: ShowcaseTab) => void
  theme: ThemeMode
  setTheme: (theme: ThemeMode) => void
  toggleTheme: () => void
}

const ShowcaseContext = createContext<ShowcaseContextValue | undefined>(undefined)

export function ShowcaseProvider({ children }: { children: React.ReactNode }) {
  const [activeTab, setActiveTab] = useState<ShowcaseTab>("workbench")

  const [theme, setTheme] = useState<ThemeMode>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("ads-theme") as ThemeMode | null
      if (stored === "light" || stored === "dark") return stored
      return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
    }
    return "dark"
  })

  useEffect(() => {
    const root = document.documentElement
    if (theme === "dark") {
      root.classList.add("dark")
    } else {
      root.classList.remove("dark")
    }
    localStorage.setItem("ads-theme", theme)
  }, [theme])

  function toggleTheme() {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"))
  }

  return (
    <ShowcaseContext.Provider
      value={{
        activeTab,
        setActiveTab,
        theme,
        setTheme,
        toggleTheme,
      }}
    >
      {children}
    </ShowcaseContext.Provider>
  )
}

export function useShowcase() {
  const context = useContext(ShowcaseContext)
  if (!context) {
    throw new Error("useShowcase must be used within a ShowcaseProvider")
  }
  return context
}
