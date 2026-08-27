import { useState, type FormEvent } from "react"

import { Button } from "@/components/ui/button"
import { FormField } from "@/components/ui/form-field"
import { cn } from "@/lib/utils"

export interface SignUpValues {
  email: string
  password: string
  confirmPassword: string
}

export interface SignUpPageProps {
  /** Wird beim Absenden mit gültigen (übereinstimmenden) Passwörtern aufgerufen. */
  onSubmit?: (values: SignUpValues) => void
  /** Klick auf "Sign in" — dieses Projekt hat keinen Router, daher ein reiner Callback. */
  onSignInClick?: () => void
  className?: string
}

/**
 * Zentrierte, minimale Sign-up-Seite: E-Mail, Passwort, Passwort bestätigen,
 * primärer Submit-Button, Link zur Anmeldung. Keine Illustration/Side-Panel.
 *
 * Variantenwahl folgt button.guidelines.md: genau eine `primary`-Aktion
 * (Sign up), `link` für die Inline-Text-Navigation zu "Sign in" (inkl. der
 * dort dokumentierten `h-auto p-0`-Korrektur für size="default").
 */
function SignUpPage({ onSubmit, onSignInClick, className }: SignUpPageProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [passwordMismatch, setPasswordMismatch] = useState(false)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (password !== confirmPassword) {
      setPasswordMismatch(true)
      return
    }

    setPasswordMismatch(false)
    onSubmit?.({ email, password, confirmPassword })
  }

  return (
    <div
      data-slot="sign-up-page"
      className={cn(
        "flex min-h-screen flex-col items-center justify-center bg-background px-[var(--space-component-md)]",
        className
      )}
    >
      <div className="flex w-full max-w-sm flex-col gap-[var(--space-component-md)] rounded-lg border border-border bg-card p-[var(--space-component-md)] text-card-foreground">
        <div className="flex flex-col gap-[var(--space-component-sm)] text-center">
          <h1 className="text-[length:var(--font-size-xl)] leading-[var(--font-line-height-xl)] font-[var(--font-weight-bold)]">
            Create your account
          </h1>
          <p className="text-[length:var(--font-size-md)] leading-[var(--font-line-height-md)] text-muted-foreground">
            Sign up to get started.
          </p>
        </div>

        <form
          className="flex flex-col gap-[var(--space-component-md)]"
          onSubmit={handleSubmit}
        >
          <FormField
            label="Email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />

          <FormField
            label="Password"
            type="password"
            autoComplete="new-password"
            placeholder="Enter password"
            value={password}
            onChange={(event) => {
              setPassword(event.target.value)
              setPasswordMismatch(false)
            }}
            required
            minLength={8}
          />

          <FormField
            label="Confirm password"
            error={passwordMismatch ? "Passwords do not match." : undefined}
            type="password"
            autoComplete="new-password"
            placeholder="Repeat password"
            value={confirmPassword}
            onChange={(event) => {
              setConfirmPassword(event.target.value)
              setPasswordMismatch(false)
            }}
            required
          />

          <Button type="submit" variant="primary" className="w-full">
            Sign up
          </Button>
        </form>

        <p className="text-center text-[length:var(--font-size-md)] leading-[var(--font-line-height-md)] text-muted-foreground">
          Already have an account?{" "}
          <Button
            type="button"
            variant="link"
            className="h-auto p-0 align-baseline"
            onClick={onSignInClick}
          >
            Sign in
          </Button>
        </p>
      </div>
    </div>
  )
}

export { SignUpPage }
