import Ajv2020 from "ajv/dist/2020"
import addFormats from "ajv-formats"
import schema from "./agentic-token.schema.json"

export interface Scope { domain: string; journey: string; actor: string }

interface Token {
  $value: unknown
  $extensions: { agentic: {
    ruleId: string
    scope: Scope
    useFor: string[]
    avoidFor: string[]
    maxAgency: number
    reviewBy: string
  } }
}

export interface Diagnostic {
  code: string
  source: string
  reason: string
  replacement?: string
}

// The profile requires $value but delegates its type to the DTCG registry.
const ajv = new Ajv2020({ allErrors: true, strictRequired: false, ownProperties: true })
addFormats(ajv)
const matchesProfile = ajv.compile<Token>(schema)

function pointer(segment: string) {
  return segment.replaceAll("~", "~0").replaceAll("/", "~1")
}

export function validateToken(leaf: unknown, source = "#"): Diagnostic[] {
  if (matchesProfile(leaf)) return []
  return (matchesProfile.errors ?? []).map(error => {
    const property = error.params.missingProperty ?? error.params.additionalProperty
    return {
      code: `schema.${error.keyword}`,
      source: source + error.instancePath + (property ? "/" + pointer(property) : ""),
      reason: error.message ?? error.keyword,
    }
  })
}

function record(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

export interface Usage {
  purpose: string
  agency: 1 | 2 | 3 | 4
  scope: Scope
  // Preferred semantic token for this component slot, determined by its owner.
  expected: string
}

/** A registry snapshot. Only the consulted leaves need the organizational profile. */
export function createTokenLinter(registry: unknown, file: string) {
  const leaves = new Map<string, Record<string, unknown>>()
  function visit(node: unknown, path: string[]) {
    if (!record(node)) return
    if (Object.hasOwn(node, "$value")) {
      leaves.set(path.join("."), structuredClone(node))
      return
    }
    for (const [key, child] of Object.entries(node)) {
      if (!key.startsWith("$") && !key.includes(".")) visit(child, [...path, key])
    }
  }
  visit(registry, [])

  function source(path: string) {
    return file + "#/" + path.split(".").map(pointer).join("/")
  }

  function check(path: string, usage: Usage, at: number): Diagnostic[] {
    const seen = new Set<string>()
    let current = path
    while (!seen.has(current)) {
      seen.add(current)
      const leaf = leaves.get(current)
      const ref = source(current)
      if (!leaf) return [{ code: "unknown-token", source: ref, reason: `Unknown token '${current}'.` }]
      // Primitive alias targets may carry raw values without an agent policy.
      if (current === path || (record(leaf.$extensions) && Object.hasOwn(leaf.$extensions, "agentic"))) {
        if (!matchesProfile(leaf)) return validateToken(leaf, ref)
        const rule = leaf.$extensions.agentic
        const ruleSource = ref + "/$extensions/agentic"
        const reject = (code: string, field: string, reason: string) =>
          [{ code, source: ruleSource + "/" + field, reason: `${rule.ruleId}: ${reason}` }]
        if (rule.scope.domain !== usage.scope.domain || rule.scope.journey !== usage.scope.journey ||
            rule.scope.actor !== usage.scope.actor) {
          return reject("scope", "scope", "The token is outside the requested scope.")
        }
        if (!Number.isInteger(usage.agency) || usage.agency < 1 || usage.agency > rule.maxAgency) {
          return reject("max-agency", "maxAgency", `Requested agency exceeds the permitted range 1-${rule.maxAgency}.`)
        }
        if (!Number.isFinite(at) || at >= Date.parse(rule.reviewBy)) {
          return reject("review-due", "reviewBy", `Review required by ${rule.reviewBy}.`)
        }
        if (rule.avoidFor.includes(usage.purpose)) {
          return reject("avoid-for", "avoidFor", `'${current}' forbids '${usage.purpose}'.`)
        }
        if (!rule.useFor.includes(usage.purpose)) {
          return reject("use-for", "useFor", `'${current}' permits only ${rule.useFor.join(", ")}.`)
        }
      }
      const value = leaf.$value
      const alias = typeof value === "string" && /^\{([^{}]+)\}$/.exec(value)
      if (!alias) return []
      current = alias[1]
    }
    return [{ code: "alias-cycle", source: source(current), reason: `Cyclic token alias at '${current}'.` }]
  }

  function lint(value: string, usage: Usage, at = Date.now()): Diagnostic[] {
    const path = /^\{([^{}]+)\}$/.exec(value)?.[1] ?? value
    const hex = /#(?:[\da-f]{8}|[\da-f]{6}|[\da-f]{4}|[\da-f]{3})\b/i.exec(value)?.[0]
    const findings = hex
      ? [{ code: "inline-hex", source: source(usage.expected), reason: `Literal '${hex}' in '${value}' bypasses the '${usage.purpose}' token.` }]
      : check(path, usage, at)
    if (path === usage.expected) return findings
    const expectedErrors = check(usage.expected, usage, at)
    if (expectedErrors.length) return [...findings, ...expectedErrors]
    if (!findings.length) findings.push({
      code: "wrong-slot", source: source(usage.expected), reason: `This slot requires '${usage.expected}'.`,
    })
    return findings.map(issue => ({ ...issue, replacement: usage.expected }))
  }
  return { lint, source }
}
