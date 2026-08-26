import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

export interface LoginPageProps {
  /** Wird beim Absenden des Formulars mit den aktuellen Feldwerten aufgerufen. Keine echte Auth-Logik hier. */
  onSubmit?: (values: { email: string; password: string }) => void
  /** Klick auf "Forgot password?". */
  onForgotPassword?: () => void
  /** Klick auf "Sign up" im Footer-Link. */
  onSignUp?: () => void
  className?: string
}

/**
 * Login-Seite: E-Mail + Passwort, primäre Sign-in-Aktion, Forgot-Password-Link
 * und Sign-up-Link. Reine UI-Komposition aus bestehenden `Button`/`Input`-
 * Komponenten und bestehenden Tokens -- keine neuen Varianten, keine neuen
 * Rohwerte. Kein Illustrations-/Bildbereich, ein einzelner zentrierter Block.
 */
function LoginPage({
  onSubmit,
  onForgotPassword,
  onSignUp,
  className,
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
      className={cn(
        "flex min-h-svh w-full items-center justify-center bg-background p-[var(--space-component-md)]",
        className
      )}
    >
      <div className="flex w-full max-w-sm flex-col gap-[var(--space-component-md)]">
        <h1 className="text-center text-[length:var(--font-size-xl)] leading-[var(--font-line-height-xl)] font-[var(--font-weight-bold)] text-foreground">
          Welcome back
        </h1>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-[var(--space-component-md)]"
        >
          <div className="flex flex-col gap-[var(--space-component-sm)]">
            <label
              htmlFor="login-email"
              className="text-[length:var(--font-size-md)] leading-[var(--font-line-height-md)] text-foreground"
            >
              Email
            </label>
            <Input
              id="login-email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>

          <div className="flex flex-col gap-[var(--space-component-sm)]">
            <div className="flex items-baseline justify-between gap-[var(--space-component-sm)]">
              <label
                htmlFor="login-password"
                className="text-[length:var(--font-size-md)] leading-[var(--font-line-height-md)] text-foreground"
              >
                Password
              </label>
              <Button
                type="button"
                variant="link"
                className="h-auto p-0"
                onClick={onForgotPassword}
              >
                Forgot password?
              </Button>
            </div>
            <Input
              id="login-password"
              type="password"
              autoComplete="current-password"
              placeholder="Enter password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </div>

          <Button type="submit" variant="primary" className="w-full">
            Sign in
          </Button>
        </form>

        <p className="text-center text-[length:var(--font-size-md)] leading-[var(--font-line-height-md)] text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Button
            type="button"
            variant="link"
            className="h-auto p-0"
            onClick={onSignUp}
          >
            Sign up
          </Button>
        </p>
      </div>
    </div>
  )
}

export { LoginPage }
