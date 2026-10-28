import type React from "react"

export interface PageHeaderProps {
  title: string
  subtitle: string
  action?: React.ReactNode
  className?: string
}

export function PageHeader({
  title,
  subtitle,
  action,
  className = "",
}: PageHeaderProps) {
  return (
    <header className={`mb-6 ${className}`}>
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            {title}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-2xl leading-relaxed">
            {subtitle}
          </p>
        </div>
        {action}
      </div>
    </header>
  )
}
