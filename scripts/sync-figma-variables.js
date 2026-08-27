import { execFileSync } from 'node:child_process'
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { homedir, tmpdir } from 'node:os'
import { basename, join } from 'node:path'
import { stripVTControlCharacters } from 'node:util'

const ROOT = new URL('..', import.meta.url)
const TOKENS_PATH = new URL('../src/tokens/tokens.figma.json', import.meta.url)

// No fallback on purpose: a silently-guessed target is exactly how a prior
// run synced into the wrong Figma file. The expected name is set explicitly
// in the "tokens:sync:figma" script in package.json, not hidden in here.
const EXPECTED_FIGMA_DOCUMENT = process.env.FIGMA_DOCUMENT_NAME
if (!EXPECTED_FIGMA_DOCUMENT) {
  throw new Error(
    'FIGMA_DOCUMENT_NAME is not set. Refusing to guess which Figma file to sync into — ' +
      'set it to the exact document name (see the "tokens:sync:figma" script in package.json).',
  )
}

// Variables that intentionally live only in Figma (see FIGMA_SYNC_VALIDATION.md
// "Font family" section) — never flagged as orphaned even though they have
// no corresponding entry in tokens.figma.json.
// primitive/font/size/sm and primitive/font/lineHeight/sm no longer belong here:
// code caught up (see FIGMA_SYNC_VALIDATION.md "Code caught up to Figma") and
// they now exist in tokens.figma.json too, so the normal primitive sync path
// covers them like any other token.
const MANUALLY_MAINTAINED_VARIABLES = ['primitive/font/family/base']

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

// Figma has no composite "text" variable type — only COLOR/FLOAT/STRING/
// BOOLEAN. Bundling font-size/weight/line-height into one reusable, named
// thing requires a Text Style, a separate Figma concept from Variables.
// This mirrors the same idempotent create-or-update + bind pattern as
// primitives/semantics above, applied to a style object instead of a node.
// Generic on purpose: Button was the first caller, Headline (Step 7) is the
// second — proves this is a reusable helper, not a one-off Button function.
function upsertTextStyle({
  styleName,
  fontFamily,
  fontStyle,
  fontSizePx,
  lineHeightPx,
  fontSizeVarName,
  lineHeightVarName,
  fontWeightVarName,
  fontFamilyVarName,
}) {
  return parseEvalResult(
    runEval(`
await figma.loadFontAsync({ family: ${JSON.stringify(fontFamily)}, style: ${JSON.stringify(fontStyle)} });

const variables = await figma.variables.getLocalVariablesAsync();
const byName = new Map(variables.map((variable) => [variable.name, variable]));
const fontSizeVar = byName.get(${JSON.stringify(fontSizeVarName)});
const fontWeightVar = byName.get(${JSON.stringify(fontWeightVarName)});
const lineHeightVar = byName.get(${JSON.stringify(lineHeightVarName)});
const fontFamilyVar = byName.get(${JSON.stringify(fontFamilyVarName)});
if (!fontSizeVar || !lineHeightVar) throw new Error('Required font variables not found for style ${styleName}');

const existingStyles = await figma.getLocalTextStylesAsync();
let style = existingStyles.find((candidate) => candidate.name === ${JSON.stringify(styleName)});
let status = 'updated';
if (!style) {
  style = figma.createTextStyle();
  style.name = ${JSON.stringify(styleName)};
  status = 'created';
}

style.fontName = { family: ${JSON.stringify(fontFamily)}, style: ${JSON.stringify(fontStyle)} };
style.fontSize = ${fontSizePx};
style.lineHeight = { value: ${lineHeightPx}, unit: 'PIXELS' };
style.setBoundVariable('fontSize', fontSizeVar);
style.setBoundVariable('lineHeight', lineHeightVar);

let fontWeightBound = false;
if (fontWeightVar) {
  try {
    style.setBoundVariable('fontWeight', fontWeightVar);
    fontWeightBound = true;
  } catch (error) {
    fontWeightBound = false;
  }
}

let fontFamilyBound = false;
if (fontFamilyVar) {
  try {
    style.setBoundVariable('fontFamily', fontFamilyVar);
    fontFamilyBound = true;
  } catch (error) {
    fontFamilyBound = false;
  }
}

return { status, styleId: style.id, fontWeightBound, fontFamilyBound };
`),
  )
}

// Applies an already-created text style (by id) to every TEXT node with the
// given name inside a named COMPONENT_SET. Separate from upsertTextStyle
// because "create/update a style" and "apply it somewhere" are independent
// concerns -- Headline has no component set to apply to yet (no Figma node
// built for it), so it only calls upsertTextStyle, not this.
function applyTextStyleToComponentSetLabels(styleId, componentSetName, textNodeName) {
  return parseEvalResult(
    runEval(`
const set = figma.currentPage.findOne(
  (node) => node.type === 'COMPONENT_SET' && node.name === ${JSON.stringify(componentSetName)},
);
if (!set) throw new Error(${JSON.stringify(`${componentSetName} component set not found on the current page`)});
const labels = set.findAll((node) => node.type === 'TEXT' && node.name === ${JSON.stringify(textNodeName)});
if (labels.length === 0) throw new Error(${JSON.stringify(`No "${textNodeName}" text node found inside the ${componentSetName} component set`)});

const appliedTo = [];
for (const label of labels) {
  if (typeof label.setTextStyleIdAsync === 'function') {
    await label.setTextStyleIdAsync(${JSON.stringify(styleId)});
  } else {
    label.textStyleId = ${JSON.stringify(styleId)};
  }
  appliedTo.push(label.parent ? label.parent.name : label.id);
}

return { appliedTo };
`),
  )
}

// Aligns the Figma Button to what the code actually renders, not to what
// tokens.json happens to define. The code's default-variant Button never
// shows a border (base classes use border-transparent) and dims the
// Disabled state via opacity on the *same* Default colors — it never wires
// color.background.primary.disabled / color.text.primary.disabled at all
// (a deliberate Step 2 decision, see the playbook). The prior automated sync
// bound those disabled tokens anyway because they exist in tokens.json,
// which made Figma's Disabled state diverge from the live app.
function alignDisabledAndBorderToCode() {
  return parseEvalResult(
    runEval(`
const variables = await figma.variables.getLocalVariablesAsync();
const byName = new Map(variables.map((variable) => [variable.name, variable]));
const bgDefault = byName.get('semantic/color/background/primary/default');
const textDefault = byName.get('semantic/color/text/primary/default');
if (!bgDefault || !textDefault) throw new Error('Default semantic variables not found');

const buttonSet = figma.currentPage.findOne(
  (node) => node.type === 'COMPONENT_SET' && node.name === 'Button',
);
if (!buttonSet) throw new Error('Button component set not found');

const basePaint = { type: 'SOLID', color: { r: 0, g: 0, b: 0 } };
const result = [];
for (const variant of buttonSet.children) {
  variant.strokes = [];

  if (variant.name === 'State=Disabled') {
    variant.fills = [figma.variables.setBoundVariableForPaint(basePaint, 'color', bgDefault)];
    variant.opacity = 0.5;
    const label = variant.findOne((node) => node.type === 'TEXT' && node.name === 'Label');
    if (label) {
      label.fills = [figma.variables.setBoundVariableForPaint(basePaint, 'color', textDefault)];
    }
  }

  result.push({ variant: variant.name, opacity: variant.opacity, strokeCount: variant.strokes.length });
}

return { variants: result };
`),
  )
}

// Reports variables in Primitives/Semantics that no longer have a matching
// entry in tokens.figma.json (plus MANUALLY_MAINTAINED_VARIABLES) — e.g.
// after a token is deleted from tokens.json. Dry-run by default: only
// deletes when FIGMA_PRUNE_UNUSED=1 is set explicitly. No silent deletion,
// same reasoning as the document-name guard having no fallback default.
function pruneOrphanedVariables(expectedNames) {
  const shouldDelete = process.env.FIGMA_PRUNE_UNUSED === '1'
  return parseEvalResult(
    runEval(`
const expectedNames = new Set(${JSON.stringify(expectedNames)});
const shouldDelete = ${JSON.stringify(shouldDelete)};

const collections = await figma.variables.getLocalVariableCollectionsAsync();
const variables = await figma.variables.getLocalVariablesAsync();
const selectedCollections = collections.filter((collection) => ['Primitives', 'Semantics'].includes(collection.name));
const scoped = variables.filter((variable) =>
  selectedCollections.some((collection) => collection.id === variable.variableCollectionId),
);
const orphans = scoped.filter((variable) => !expectedNames.has(variable.name));

const deleted = [];
const failed = [];
if (shouldDelete) {
  for (const variable of orphans) {
    try {
      variable.remove();
      deleted.push(variable.name);
    } catch (error) {
      failed.push({ name: variable.name, error: String((error && error.message) || error) });
    }
  }
}

return {
  mode: shouldDelete ? 'prune' : 'dry-run',
  orphanNames: orphans.map((variable) => variable.name),
  deleted,
  failed,
};
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

  const buttonTextStyle = upsertTextStyle({
    styleName: 'Button',
    fontFamily: 'Geist',
    fontStyle: 'Medium',
    fontSizePx: 14,
    lineHeightPx: 20,
    fontSizeVarName: 'primitive/font/size/md',
    lineHeightVarName: 'primitive/font/lineHeight/md',
    fontWeightVarName: 'primitive/font/weight/medium',
    fontFamilyVarName: 'primitive/font/family/base',
  })
  const buttonTextStyleApplied = applyTextStyleToComponentSetLabels(buttonTextStyle.styleId, 'Button', 'Label')
  const textStyle = { ...buttonTextStyle, appliedTo: buttonTextStyleApplied.appliedTo }

  const headlineTextStyle = upsertTextStyle({
    styleName: 'Headline',
    fontFamily: 'Geist',
    fontStyle: 'Bold',
    fontSizePx: 24,
    lineHeightPx: 32,
    fontSizeVarName: 'primitive/font/size/xl',
    lineHeightVarName: 'primitive/font/lineHeight/xl',
    fontWeightVarName: 'primitive/font/weight/bold',
    fontFamilyVarName: 'primitive/font/family/base',
  })

  const codeAlignment = alignDisabledAndBorderToCode()
  const expectedNames = [...tokens.map((token) => token.name), ...MANUALLY_MAINTAINED_VARIABLES]
  const pruneResult = pruneOrphanedVariables(expectedNames)
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
    textStyle,
    headlineTextStyle,
    codeAlignment,
    prune: pruneResult,
    verification,
  }

  process.stdout.write(`${JSON.stringify(summary, null, 2)}\n`)
}

if (basename(process.argv[1]) === basename(new URL(import.meta.url).pathname)) {
  main()
}

export { loadTokens, parseEvalResult }
