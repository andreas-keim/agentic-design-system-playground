// Testfälle für den A2UI-Katalog. Der "Agent" ist hier eine Claude-Code-Session,
// die diese Nachrichtenströme von Hand aus Katalog + Guidelines erzeugt hat.
// Kein produktiver LLM-Aufruf. Jeder Fall nennt, was ein richtiges System tun sollte.
import { PLAYGROUND_CATALOG_ID } from "./catalog.api.ts"

type Msg = Record<string, unknown>
export type Fixture = {
  name: string
  note: string
  /** Was ein gutes System mit dem Fall tun müsste. */
  shouldBe: "accepted" | "rejected"
  messages: Msg[]
}

const surface = (components: Msg[]): Msg[] => [
  { version: "v0.9", createSurface: { surfaceId: "s", catalogId: PLAYGROUND_CATALOG_ID } },
  { version: "v0.9", updateComponents: { surfaceId: "s", components } },
  {
    version: "v0.9",
    updateDataModel: { surfaceId: "s", path: "/", value: { email: "", password: "" } },
  },
]

const emailField = { id: "email", component: "FormField", label: "Email", type: "email", value: { path: "/email" } }
const pwField = { id: "pw", component: "FormField", label: "Password", type: "password", value: { path: "/password" } }
const formContext = { email: { path: "/email" }, password: { path: "/password" } }
const submit = (variant = "primary", label = "Create account", id = "submit") => ({
  id,
  component: "Button",
  label,
  variant,
  action: { event: { name: "signUp", context: formContext } },
})
const root = (children: string[]) => ({ id: "root", component: "Column", children })
const title = { id: "title", component: "Headline", text: "Create your account" }

export const fixtures: Fixture[] = [
  {
    name: "01 gültiger Sign-up",
    note: "Überschrift, zwei Felder, primäre Aktion, Link-Button. So soll es aussehen.",
    shouldBe: "accepted",
    messages: surface([
      root(["title", "email", "pw", "submit", "login"]),
      title, emailField, pwField, submit(),
      { id: "login", component: "Button", label: "Already have an account?", variant: "link", action: { event: { name: "goLogin" } } },
    ]),
  },
  {
    name: "02 erfundene Komponente",
    note: "Agent nimmt 'Card', die es im Katalog nicht gibt.",
    shouldBe: "rejected",
    messages: surface([
      root(["card"]),
      { id: "card", component: "Card", child: "title" },
      title,
    ]),
  },
  {
    name: "03 Rohwert per className",
    note: "Agent versucht, einen Button per Tailwind-Klasse zu färben.",
    shouldBe: "rejected",
    messages: surface([
      root(["title", "submit"]),
      title,
      { ...submit(), className: "bg-[#ff0000] text-white" },
    ]),
  },
  {
    name: "04 Variante secondary",
    note: "button.guidelines.md: 'secondary nicht weiter neu einsetzen' (Interims-Regel). Katalog-Enum enthält sie nicht.",
    shouldBe: "rejected",
    messages: surface([root(["title", "submit"]), title, submit("secondary")]),
  },
  {
    name: "05 Pflicht-Label fehlt",
    note: "FormField ohne label (A11y: Feld ohne Beschriftung).",
    shouldBe: "rejected",
    messages: surface([
      root(["title", "email"]),
      title,
      { id: "email", component: "FormField", type: "email", value: { path: "/email" } },
    ]),
  },
  {
    name: "06 verschachtelte Column",
    note: "Column enthält Column. Katalog erlaubt als Kinder nur Headline/FormField/Button (allowedChildren).",
    shouldBe: "rejected",
    messages: surface([root(["inner"]), { id: "inner", component: "Column", children: ["title"] }, title]),
  },
  {
    name: "07 zwei primary-Buttons",
    note: "Guidelines: 'Nicht mehr als eine primary-Instanz gleichzeitig sichtbar'.",
    shouldBe: "rejected",
    messages: surface([
      root(["title", "email", "a", "b"]),
      title, emailField,
      submit("primary", "Create account", "a"),
      submit("primary", "Sign up with email", "b"),
    ]),
  },
  {
    name: "08 destructive für Abbrechen",
    note: "Guidelines: destructive 'nicht für Abbrechen'. Rein semantische Regel.",
    shouldBe: "rejected",
    messages: surface([
      root(["title", "email", "ok", "cancel"]),
      title, emailField, submit("primary", "Create account", "ok"),
      submit("destructive", "Cancel", "cancel"),
    ]),
  },
  {
    name: "09 Passwort als Klartextfeld",
    note: "Passwortfeld mit type 'text' statt 'password'. Beschreibung verlangt 'password'.",
    shouldBe: "rejected",
    messages: surface([
      root(["title", "email", "pw", "submit"]),
      title, emailField,
      { ...pwField, type: "text" },
      submit(),
    ]),
  },
  {
    name: "10 Button vor den Feldern",
    note: "Hauptaktion steht über dem Formular. Alle Bausteine gültig, Reihenfolge unsinnig.",
    shouldBe: "rejected",
    messages: surface([root(["title", "submit", "email", "pw"]), title, submit(), emailField, pwField]),
  },
  {
    name: "11 Submit ohne Formulardaten",
    note: "Beim ersten Rendern gefunden: der eigene 'gültige' Fall schickte beim Klick context:{} an den Agenten.",
    shouldBe: "rejected",
    messages: surface([
      root(["title", "email", "pw", "submit"]),
      title, emailField, pwField,
      { id: "submit", component: "Button", label: "Create account", variant: "primary", action: { event: { name: "signUp" } } },
    ]),
  },
  {
    name: "12 Drei Headlines statt einer",
    note: "Beschreibung: 'genau eine pro Seite'.",
    shouldBe: "rejected",
    messages: surface([
      root(["t1", "t2", "t3"]),
      { id: "t1", component: "Headline", text: "Hello" },
      { id: "t2", component: "Headline", text: "Welcome" },
      { id: "t3", component: "Headline", text: "Sign up now" },
    ]),
  },
]
