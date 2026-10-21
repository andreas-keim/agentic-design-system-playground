import { useState } from "react"

import { Button } from "@/components/ui/button"
import { FormField } from "@/components/ui/form-field"
import { cn } from "@/lib/utils"

export interface LoginPageProps {
  /** Wird beim Absenden des Formulars mit den aktuellen Feldwerten aufgerufen. */
  onSubmit?: (values: { email: string; password: string }) => void
  /** Klick auf "Forgot password?". */
  onForgotPassword?: () => void
  /** Klick auf "Sign up" im Footer-Link. */
  onSignUp?: () => void
  className?: string
  title?: string
  subtitle?: string
}

/**
 * Enterprise Workspace SSO Login View:
 * Saubere B2B-Anmeldung mit SSO-Fokus, konsistenten Paddings und ohne doppelte Background-Schichten.
 */
function LoginPage({
  onSubmit,
  onForgotPassword,
  onSignUp,
  className,
  title = "Enterprise Workspace SSO",
  subtitle = "Authenticate with your organization account to access clusters.",
}: LoginPageProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    onSubmit?.({ email, password })
  }

  return (
    <div
      data-slot="login-page"
      className={cn("w-full flex flex-col gap-6", className)}
    >
      <div className="flex flex-col gap-1 text-center">
        <h3 className="text-base font-bold tracking-tight text-foreground">
          {title}
        </h3>
        {subtitle && (
          <p className="text-xs text-muted-foreground leading-normal">
            {subtitle}
          </p>
        )}
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4"
      >
        <FormField
          label="Corporate Email"
          type="email"
          autoComplete="email"
          placeholder="admin@enterprise.internal"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />

        <FormField
          label="Security Token / Password"
          labelAction={
            <Button
              type="button"
              variant="link"
              className="h-auto p-0 text-xs"
              onClick={onForgotPassword}
            >
              Forgot?
            </Button>
          }
          type="password"
          autoComplete="current-password"
          placeholder="••••••••••••"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />

        <Button type="submit" variant="primary" className="w-full mt-1">
          Authenticate & Sign In
        </Button>
      </form>

      <div className="pt-2 border-t border-border/50 text-center text-xs text-muted-foreground">
        Need access?{" "}
        <Button
          type="button"
          variant="link"
          className="h-auto p-0 text-xs font-medium"
          onClick={onSignUp}
        >
          Request Provisioning
        </Button>
      </div>
    </div>
  )
}

export { LoginPage }
