// Selbsttest für Übung 3. Aufruf: node src/a2ui/uebungen/pruefe.ts [--loesung]
type Comp = { id: string; component: string; [key: string]: unknown }
const useSolution = process.argv.includes("--loesung")
const mod = await import(useSolution ? "./loesungen/03-eigene-regel.ts" : "./03-eigene-regel.ts")
const rule = mod.emailFeldTyp as (c: Comp[]) => string | null

const f = (label: string, type?: string): Comp => ({ id: "f", component: "FormField", label, ...(type ? { type } : {}) })
const cases: { name: string; comps: Comp[]; flagged: boolean }[] = [
  { name: "Email mit type text", comps: [f("Email", "text")], flagged: true },
  { name: "E-Mail-Adresse ohne type (zählt als text)", comps: [f("E-Mail-Adresse")], flagged: true },
  { name: "Email mit type email", comps: [f("Email", "email")], flagged: false },
  { name: "Username mit type text", comps: [f("Username", "text")], flagged: false },
  { name: "Falle: 'Mailing-Liste' ist kein E-Mail-Feld", comps: [f("Mailing-Liste", "text")], flagged: false },
  { name: "Button mit Label Email wird nicht geprüft", comps: [{ id: "b", component: "Button", label: "Email", variant: "primary" }], flagged: false },
]

let failed = 0
for (const c of cases) {
  const out = rule(c.comps)
  const ok = (out !== null) === c.flagged
  if (!ok) failed++
  console.log(ok ? "ok    " : "FEHLER", c.name.padEnd(50), "soll:", c.flagged ? "melden" : "nichts", "→", out === null ? "nichts" : out)
}
console.log(failed === 0 ? `\nAlle ${cases.length} Fälle bestehen${useSolution ? " (Musterlösung)" : ""}.` : `\n${failed} von ${cases.length} Fällen schlagen fehl.`)
