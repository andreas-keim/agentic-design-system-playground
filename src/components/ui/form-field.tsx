import { useId, type ReactNode } from "react"

import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

export interface FormFieldProps
  extends Omit<
    React.ComponentProps<typeof Input>,
    "id" | "aria-invalid" | "aria-describedby"
  > {
  label: ReactNode
  /** Optionales Element neben dem Label, z.B. ein "Forgot password?"-Link. */
  labelAction?: ReactNode
  /** Fehlertext. Vorhanden = Feld gilt als invalid (setzt aria-invalid/aria-describedby). */
  error?: string
  id?: string
  className?: string
}

function FormField({
  label,
  labelAction,
  error,
  id,
  className,
  ...props
}: FormFieldProps) {
  const generatedId = useId()
  const fieldId = id ?? generatedId
  const errorId = `${fieldId}-error`

  return (
    <div className={cn("flex flex-col gap-[var(--space-component-sm)]", className)}>
      <div className="flex items-baseline justify-between gap-[var(--space-component-sm)]">
        <label
          htmlFor={fieldId}
          className="text-[length:var(--font-size-md)] leading-[var(--font-line-height-md)] font-[var(--font-weight-medium)] text-foreground"
        >
          {label}
        </label>
        {labelAction}
      </div>
      <Input
        id={fieldId}
        aria-invalid={!!error}
        aria-describedby={error ? errorId : undefined}
        {...props}
      />
      {error && (
        <p
          id={errorId}
          className="text-[length:var(--font-size-md)] leading-[var(--font-line-height-md)] text-destructive"
        >
          {error}
        </p>
      )}
    </div>
  )
}

export { FormField }
