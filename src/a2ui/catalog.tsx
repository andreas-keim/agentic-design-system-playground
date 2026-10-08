// A2UI-Katalog des Playgrounds, Implementierungs-Ebene: mappt die Schema-Namen
// aus catalog.api.ts auf die ECHTEN Komponenten des Design Systems.
// Der Agent kann hier weder Klassen noch Tokens setzen; was die Guidelines als
// Pflicht-Handgriff beschreiben (link-Button: h-auto p-0), passiert in diesem File.
import { useState } from "react"
import { Catalog } from "@a2ui/web_core/v0_9"
import { createComponentImplementation } from "@a2ui/react/v0_9"

import { Button } from "@/components/ui/button"
import { FormField } from "@/components/ui/form-field"
import { ButtonApi, ColumnApi, FormFieldApi, HeadlineApi, PLAYGROUND_CATALOG_ID } from "./catalog.api"

const Column = createComponentImplementation(ColumnApi, ({ props, buildChild }) => (
  <div className="flex flex-col gap-[var(--space-component-md)]">
    {(props.children as unknown as string[]).map((id) => (
      <div key={id}>{buildChild(id)}</div>
    ))}
  </div>
))

const Headline = createComponentImplementation(HeadlineApi, ({ props }) => (
  <h1 className="text-center text-[length:var(--font-size-xl)] leading-[var(--font-line-height-xl)] font-[var(--font-weight-bold)] text-foreground">
    {props.text}
  </h1>
))

const FormFieldImpl = createComponentImplementation(FormFieldApi, ({ props }) => {
  const [touched, setTouched] = useState(false)
  const error = touched ? props.validationErrors?.[0] : undefined
  return (
    <FormField
      label={props.label}
      type={props.type ?? "text"}
      placeholder={props.placeholder}
      value={props.value ?? ""}
      error={error}
      onChange={(e) => props.setValue?.(e.target.value)}
      onBlur={() => setTouched(true)}
    />
  )
})

const ButtonImpl = createComponentImplementation(ButtonApi, ({ props }) => {
  const variant = props.variant ?? "primary"
  return (
    <Button
      variant={variant}
      // Guideline "Bekannte Lücke": link erbt sonst volles Padding -> im Katalog gelöst, nicht beim Agenten.
      className={variant === "link" ? "h-auto p-0" : undefined}
      disabled={props.isValid === false}
      onClick={() => props.action?.()}
    >
      {props.label}
    </Button>
  )
})

export const playgroundCatalog = new Catalog(
  PLAYGROUND_CATALOG_ID,
  "v0.9",
  [Column, Headline, FormFieldImpl, ButtonImpl],
  [],
)
