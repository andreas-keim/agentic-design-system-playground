import { execFileSync } from 'node:child_process'
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { homedir, tmpdir } from 'node:os'
import { basename, join } from 'node:path'
import { stripVTControlCharacters } from 'node:util'

const ROOT = new URL('..', import.meta.url)
const TOKENS_PATH = new URL('../src/tokens/tokens.figma.json', import.meta.url)
const EXPECTED_FIGMA_DOCUMENT = process.env.FIGMA_DOCUMENT_NAME || 'Gamified activity'

function resolveCli() {
  const configured = process.env.FIGMA_CLI_BIN
  if (configured) return configured

  const localClone = join(homedir(), 'figma-cli', 'src', 'index.js')
  if (existsSync(localClone)) return localClone

  return 'figma-cli'
}

function cliCommand(args) {
  const cli = resolveCli()
  const isJavaScriptEntry = cli.endsWith('.js')
  return {
    command: isJavaScriptEntry ? process.execPath : cli,
    args: isJavaScriptEntry ? [cli, ...args] : args,
  }
}

function runCli(args, options = {}) {
  const invocation = cliCommand(args)
  return execFileSync(invocation.command, invocation.args, {
    cwd: new URL('.', ROOT),
    encoding: 'utf8',
    stdio: options.capture ? ['ignore', 'pipe', 'pipe'] : 'inherit',
  })
}

function runEval(code) {
  const directory = mkdtempSync(join(tmpdir(), 'figma-token-sync-'))
  const file = join(directory, 'eval.js')
  writeFileSync(file, code)

  try {
    return runCli(['eval', '--file', file], { capture: true })
  } finally {
    rmSync(directory, { recursive: true, force: true })
  }
}

function stripAnsi(value) {
  return stripVTControlCharacters(value).trim()
}

function parseEvalResult(output) {
  const clean = stripAnsi(output)
  const firstObject = clean.indexOf('{')
  const firstArray = clean.indexOf('[')
  const starts = [firstObject, firstArray].filter((index) => index >= 0)

  if (starts.length === 0) throw new Error(`figma-cli eval returned no JSON: ${clean}`)
  return JSON.parse(clean.slice(Math.min(...starts)))
}

function loadTokens() {
  const source = JSON.parse(readFileSync(TOKENS_PATH, 'utf8'))
  const tokens = Object.values(source)
  const names = new Set(tokens.map((token) => token.name))

  for (const token of tokens) {
    if (token.aliasOf && !names.has(token.aliasOf)) {
      throw new Error(`Alias target does not exist: ${token.name} -> ${token.aliasOf}`)
    }
  }

  return tokens
}

function assertTargetDocument() {
  const target = parseEvalResult(
    runEval(`
return {
  documentName: figma.root.name,
  editorType: figma.editorType,
};
`),
  )

  if (target.editorType !== 'figma') {
    throw new Error(`Expected a Figma Design file, connected editor is: ${target.editorType}`)
  }

  if (target.documentName !== EXPECTED_FIGMA_DOCUMENT) {
    throw new Error(
      `Refusing to sync the wrong Figma file: expected "${EXPECTED_FIGMA_DOCUMENT}", connected to "${target.documentName}"`,
    )
  }

  return target
}

function ensureCollections() {
  return parseEvalResult(
    runEval(`
const definitions = ${JSON.stringify(['Primitives', 'Semantics'])};
const existing = await figma.variables.getLocalVariableCollectionsAsync();
const result = [];
for (const name of definitions) {
  let collection = existing.find((item) => item.name === name);
  let status = 'existing';
  if (!collection) {
    collection = figma.variables.createVariableCollection(name);
    status = 'created';
  }
  if (collection.modes[0].name !== 'Value') {
    collection.renameMode(collection.modes[0].modeId, 'Value');
  }
  result.push({ name, id: collection.id, modeId: collection.modes[0].modeId, status });
}
return { collections: result };
`),
  )
}

function readInventory() {
  return parseEvalResult(
    runEval(`
const collections = await figma.variables.getLocalVariableCollectionsAsync();
const variables = await figma.variables.getLocalVariablesAsync();
return {
  collections: collections
    .filter((collection) => ['Primitives', 'Semantics'].includes(collection.name))
    .map((collection) => ({
      id: collection.id,
      name: collection.name,
      variables: variables
        .filter((variable) => variable.variableCollectionId === collection.id)
        .map((variable) => ({ id: variable.id, name: variable.name, type: variable.resolvedType })),
    })),
};
`),
  )
}

function createMissingPrimitives(primitives, inventory) {
  const collection = inventory.collections.find((item) => item.name === 'Primitives')
  const existingNames = new Set(collection?.variables.map((variable) => variable.name) ?? [])
  const missing = primitives.filter((token) => !existingNames.has(token.name))

  if (missing.length === 0) return { created: 0 }

  const payload = missing.map((token) => ({
    name: token.name,
    type: token.type,
    value: token.resolvedValue,
  }))

  runCli(['variables', 'create-batch', JSON.stringify(payload), '--collection', 'Primitives'])
  return { created: missing.length }
}

function updatePrimitives(primitives) {
  return parseEvalResult(
    runEval(`
const definitions = ${JSON.stringify(primitives)};
const collections = await figma.variables.getLocalVariableCollectionsAsync();
const collection = collections.find((item) => item.name === 'Primitives');
if (!collection) throw new Error('Primitives collection not found');
const modeId = collection.modes[0].modeId;
const variables = await figma.variables.getLocalVariablesAsync();
const byName = new Map(
  variables
    .filter((variable) => variable.variableCollectionId === collection.id)
    .map((variable) => [variable.name, variable]),
);
const updated = [];
for (const definition of definitions) {
  const variable = byName.get(definition.name);
  if (!variable) throw new Error('Primitive missing after create-batch: ' + definition.name);
  if (variable.resolvedType !== definition.type) {
    throw new Error('Type mismatch for ' + definition.name + ': ' + variable.resolvedType + ' != ' + definition.type);
  }
  let value = definition.resolvedValue;
  if (definition.type === 'COLOR') value = figma.util.solidPaint(value).color;
  variable.setValueForMode(modeId, value);
  variable.scopes = definition.scopes;
  variable.setVariableCodeSyntax('WEB', definition.codeSyntax);
  updated.push({ id: variable.id, name: variable.name });
}
return { updated, count: updated.length };
`),
  )
}

function upsertSemantics(semantics) {
  return parseEvalResult(
    runEval(`
const definitions = ${JSON.stringify(semantics)};
const collections = await figma.variables.getLocalVariableCollectionsAsync();
const primitiveCollection = collections.find((item) => item.name === 'Primitives');
const semanticCollection = collections.find((item) => item.name === 'Semantics');
if (!primitiveCollection || !semanticCollection) throw new Error('Token collections not found');
const semanticModeId = semanticCollection.modes[0].modeId;
const variables = await figma.variables.getLocalVariablesAsync();
const primitivesByName = new Map(
  variables
    .filter((variable) => variable.variableCollectionId === primitiveCollection.id)
    .map((variable) => [variable.name, variable]),
);
const semanticsByName = new Map(
  variables
    .filter((variable) => variable.variableCollectionId === semanticCollection.id)
    .map((variable) => [variable.name, variable]),
);
const result = [];
for (const definition of definitions) {
  const target = primitivesByName.get(definition.aliasOf);
  if (!target) throw new Error('Alias target not found: ' + definition.aliasOf);
  if (target.resolvedType !== definition.type) {
    throw new Error('Alias type mismatch for ' + definition.name);
  }
  let variable = semanticsByName.get(definition.name);
  let status = 'updated';
  if (!variable) {
    variable = figma.variables.createVariable(definition.name, semanticCollection, definition.type);
    semanticsByName.set(definition.name, variable);
    status = 'created';
  }
  if (variable.resolvedType !== definition.type) {
    throw new Error('Type mismatch for existing semantic: ' + definition.name);
  }
  variable.setValueForMode(semanticModeId, { type: 'VARIABLE_ALIAS', id: target.id });
  variable.scopes = definition.scopes;
  variable.setVariableCodeSyntax('WEB', definition.codeSyntax);
  result.push({ id: variable.id, name: variable.name, aliasOf: target.name, status });
}
return { semantics: result, count: result.length };
`),
  )
}

function verify() {
  return parseEvalResult(
    runEval(`
const collections = await figma.variables.getLocalVariableCollectionsAsync();
const variables = await figma.variables.getLocalVariablesAsync();
const selectedCollections = collections.filter((collection) => ['Primitives', 'Semantics'].includes(collection.name));
const selectedVariables = variables.filter((variable) =>
  selectedCollections.some((collection) => collection.id === variable.variableCollectionId),
);
const variablesById = new Map(selectedVariables.map((variable) => [variable.id, variable]));
const aliases = [];
const brokenAliases = [];
for (const variable of selectedVariables) {
  for (const value of Object.values(variable.valuesByMode)) {
    if (!value || value.type !== 'VARIABLE_ALIAS') continue;
    const target = variablesById.get(value.id);
    const item = {
      name: variable.name,
      type: value.type,
      targetId: value.id,
      targetName: target?.name ?? null,
    };
    aliases.push(item);
    if (!target) brokenAliases.push(item);
  }
}
return {
  collections: selectedCollections.map((collection) => ({
    id: collection.id,
    name: collection.name,
    modes: collection.modes.map((mode) => mode.name),
    variableCount: selectedVariables.filter((variable) => variable.variableCollectionId === collection.id).length,
    variableNames: selectedVariables
      .filter((variable) => variable.variableCollectionId === collection.id)
      .map((variable) => variable.name),
  })),
  aliases,
  brokenAliases,
  missingCodeSyntax: selectedVariables.filter((variable) => !variable.codeSyntax.WEB).map((variable) => variable.name),
  duplicateNames: selectedCollections.flatMap((collection) => {
    const names = selectedVariables
      .filter((variable) => variable.variableCollectionId === collection.id)
      .map((variable) => variable.name);
    return names.filter((name, index) => names.indexOf(name) !== index).map((name) => ({ collection: collection.name, name }));
  }),
};
`),
  )
}

function main() {
  const tokens = loadTokens()
  const primitives = tokens.filter((token) => !token.aliasOf)
  const semantics = tokens.filter((token) => token.aliasOf)

  const target = assertTargetDocument()
  const collections = ensureCollections()
  const inventory = readInventory()
  const creation = createMissingPrimitives(primitives, inventory)
  const primitiveUpdate = updatePrimitives(primitives)
  const semanticUpdate = upsertSemantics(semantics)
  const verification = verify()

  const summary = {
    target,
    collections: collections.collections,
    primitives: { total: primitives.length, created: creation.created, updated: primitiveUpdate.count },
    semantics: {
      total: semantics.length,
      created: semanticUpdate.semantics.filter((item) => item.status === 'created').length,
      updated: semanticUpdate.semantics.filter((item) => item.status === 'updated').length,
    },
    verification,
  }

  process.stdout.write(`${JSON.stringify(summary, null, 2)}\n`)
}

if (basename(process.argv[1]) === basename(new URL(import.meta.url).pathname)) {
  main()
}

export { loadTokens, parseEvalResult }
