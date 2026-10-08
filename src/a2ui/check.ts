// Prüft die Fixtures gegen den Katalog. Aufruf: node src/a2ui/check.ts
// Ebene 1 = A2UI-Schema/Processor (das, was das Protokoll selbst durchsetzt).
// Ebene 2 = eigene Design-Regeln (das, was das Schema nicht ausdrücken kann).
import { Catalog, MessageProcessor, STRICT_VALIDATION } from "@a2ui/web_core/v0_9"
import { catalogApis, PLAYGROUND_CATALOG_ID } from "./catalog.api.ts"
import { fixtures } from "./fixtures.ts"
import { designRules } from "./design-rules.ts"

function runSchemaLayer(messages: unknown[]): string | null {
  const catalog = new Catalog(PLAYGROUND_CATALOG_ID, "v0.9", catalogApis as never, [])
  const processor = new MessageProcessor([catalog], undefined, { validationConfig: STRICT_VALIDATION })
  try {
    processor.processMessages(messages as never)
    return null
  } catch (e) {
    return (e as Error).message.split("\n")[0].slice(0, 110)
  }
}

let rows: string[][] = []
for (const f of fixtures) {
  const schemaErr = runSchemaLayer(f.messages)
  const ruleErr = schemaErr ? null : designRules(f.messages)
  const verdict = schemaErr ? "Schema" : ruleErr ? "Design-Regel" : "durchgelassen"
  const ok = (f.shouldBe === "rejected") === (verdict !== "durchgelassen")
  rows.push([f.name, f.shouldBe === "rejected" ? "ablehnen" : "annehmen", verdict, ok ? "ok" : "LÜCKE", schemaErr ?? ruleErr ?? ""])
}
for (const r of rows) console.log(r[3].padEnd(6), r[0].padEnd(42), "soll:", r[1].padEnd(9), "→", r[2].padEnd(14), r[4])
const gaps = rows.filter((r) => r[3] === "LÜCKE")
console.log(`\n${rows.length - gaps.length}/${rows.length} wie erwartet, ${gaps.length} Lücken`)
process.exit(0)
