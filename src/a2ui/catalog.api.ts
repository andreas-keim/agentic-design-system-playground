// A2UI-Katalog des Playgrounds, Schema-Ebene (kein React, damit per Node prüfbar).
//
// Quelle der Wahrheit bleiben button.meta.json / button.guidelines.md /
// form-field.meta.json. Dieser Katalog ist eine bewusst ENGERE Sicht darauf:
// nur das, was ein Agent setzen darf. `size`, `className`, Token-Werte und die
// Variante `secondary` (Interims-Regel in button.guidelines.md) gibt es hier nicht.
// Alle Objekte sind .strict(): unbekannte Props (className, style, ...) werden abgelehnt.
import { z } from "zod"
import { CommonSchemas } from "@a2ui/web_core/v0_9"

const common = {
  accessibility: CommonSchemas.AccessibilityAttributes.optional(),
  weight: z.number().optional(),
}

export const ColumnApi = {
  name: "Column",
  schema: z
    .object({
      ...common,
      children: z
        .array(CommonSchemas.ComponentId)
        .describe(
          "Reihenfolge von oben nach unten. Überschrift zuerst, Eingabefelder in Lesereihenfolge, Aktionen (Buttons) zuletzt.",
        ),
    })
    .strict(),
  allowedChildren: ["Headline", "FormField", "Button"],
}

export const HeadlineApi = {
  name: "Headline",
  schema: z
    .object({
      ...common,
      text: CommonSchemas.DynamicString.describe(
        "Seitenüberschrift (h1), genau eine pro Seite.",
      ),
    })
    .strict(),
}

export const FormFieldApi = {
  name: "FormField",
  schema: z
    .object({
      ...common,
      label: CommonSchemas.DynamicString.describe(
        "Pflicht. Sichtbares Label, wird per for/id mit dem Eingabefeld verknüpft.",
      ),
      value: CommonSchemas.DynamicString.describe(
        "Bindung an das Datenmodell, z.B. {\"path\": \"/email\"}.",
      ),
      type: z
        .enum(["text", "email", "password"])
        .optional()
        .describe(
          "Eingabeart. Passwörter immer als 'password', E-Mail-Adressen immer als 'email'.",
        ),
      placeholder: z.string().optional(),
      checks: CommonSchemas.Checkable.shape.checks.describe(
        "Validierungsregeln. Eine fehlgeschlagene Regel erscheint als Fehlertext unter dem Feld.",
      ),
    })
    .strict(),
  allowedParents: ["Column"],
}

export const ButtonApi = {
  name: "Button",
  schema: z
    .object({
      ...common,
      label: CommonSchemas.DynamicString,
      variant: z
        .enum(["primary", "outline", "ghost", "destructive", "link"])
        .optional()
        .describe(
          "primary: die eine Hauptaktion der Seite, höchstens EINMAL pro Seite. " +
            "outline: sekundäre Aktion neben primary. " +
            "ghost: niedrigste Betonung in dichten Kontexten. " +
            "destructive: ausschließlich für zerstörerische Aktionen (Löschen), nie für 'Abbrechen'. " +
            "link: Aktion, die wie Inline-Navigation wirken soll.",
        ),
      action: CommonSchemas.Action,
      checks: CommonSchemas.Checkable.shape.checks,
    })
    .strict(),
  allowedParents: ["Column"],
}

export const PLAYGROUND_CATALOG_ID =
  "https://github.com/andreas-keim/agentic-design-system-playground/a2ui/v1/catalog.json"

export const catalogApis = [ColumnApi, HeadlineApi, FormFieldApi, ButtonApi]
