import React from "react"

export interface TabItem<T extends string = string> {
  id: T
  label: React.ReactNode
}

export interface SegmentedTabsProps<T extends string = string> {
  items: TabItem<T>[]
  value: T
  onChange: (value: T) => void
  size?: "sm" | "md"
  className?: string
  fullWidth?: boolean
}

export function SegmentedTabs<T extends string = string>({
  items,
  value,
  onChange,
  size = "sm",
  className = "",
  fullWidth = false,
}: SegmentedTabsProps<T>) {
  const isMd = size === "md"

  return (
    <div
      role="tablist"
      className={`inline-flex items-center border border-border/60 bg-muted/80 max-w-full overflow-x-auto scrollbar-none ${
        isMd ? "p-1 rounded-xl gap-1" : "p-0.5 rounded-lg gap-0.5"
      } ${fullWidth ? "w-full" : ""} ${className}`}
    >
      {items.map((item) => {
        const isActive = item.id === value
        return (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(item.id)}
            className={`transition-all cursor-pointer whitespace-nowrap text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
              fullWidth ? "flex-1" : ""
            } ${
              isMd
                ? "rounded-lg px-3.5 py-1.5 text-xs"
                : "rounded-md px-3 py-1 text-xs"
            } ${
              isActive
                ? "bg-card text-foreground font-semibold shadow-xs"
                : "text-muted-foreground hover:text-foreground font-medium"
            }`}
          >
            {item.label}
          </button>
        )
      })}
    </div>
  )
}
