export interface PageHeaderProps {
  title: string
  subtitle: string
  className?: string
}

export function PageHeader({
  title,
  subtitle,
  className = "",
}: PageHeaderProps) {
  return (
    <header className={`mb-6 ${className}`}>
      <h1 className="text-2xl font-bold tracking-tight text-foreground">
        {title}
      </h1>
      <p className="text-sm text-muted-foreground mt-1 max-w-2xl leading-relaxed">
        {subtitle}
      </p>
    </header>
  )
}
