import { Input as InputPrimitive, type InputProps } from "@base-ui/react/input"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: InputProps) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "w-full min-w-0 rounded-lg border border-input bg-transparent px-[var(--space-component-md)] py-[var(--space-component-sm)] text-[length:var(--font-size-md)] leading-[var(--font-line-height-md)] transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 dark:bg-input/30 dark:disabled:bg-input/80",
        // Gültiges Feld: Fokus-Zustand (normaler violetter Ring)
        "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
        // Invalid ohne Fokus: destructive Border, kein dauerhafter Fokus-Ring
        "aria-invalid:border-destructive dark:aria-invalid:border-destructive/60",
        // Invalid + focus-visible: destructive Border bleibt, klarer destructive Fokus-Ring erscheint
        "aria-invalid:focus-visible:border-destructive aria-invalid:focus-visible:ring-3 aria-invalid:focus-visible:ring-destructive/25 dark:aria-invalid:focus-visible:ring-destructive/40",
        className
      )}
      {...props}
    />
  )
}

export { Input }
