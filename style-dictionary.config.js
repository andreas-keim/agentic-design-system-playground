import StyleDictionary from 'style-dictionary'

function toFigmaPath(path) {
  const [category, ...rest] = path

  if (category === 'colors') return ['primitive', ...rest].join('/')
  if (category === 'color') return ['semantic', 'color', ...rest].join('/')
  if (category === 'radii') return ['primitive', 'radius', ...rest].join('/')

  return ['primitive', category, ...rest].join('/')
}

function toFigmaType(type) {
  if (type === 'color') return 'COLOR'
  if (type === 'dimension' || type === 'number') return 'FLOAT'

  throw new Error(`Unsupported Figma variable type: ${type}`)
}

function toFigmaValue(value, type) {
  if (type === 'dimension') {
    const match = /^(-?\d+(?:\.\d+)?)px$/.exec(value)
    if (!match) throw new Error(`Only px dimensions can be synced to Figma: ${value}`)
    return Number(match[1])
  }

  return value
}

function toCssVariable(path) {
  const kebabPath = path.map((segment) =>
    segment.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase(),
  )
  return `var(--${kebabPath.join('-')})`
}

function toScopes(path) {
  if (path[0] === 'colors') return []
  if (path[0] === 'color' && path[1] === 'background') return ['FRAME_FILL', 'SHAPE_FILL']
  if (path[0] === 'color' && path[1] === 'text') return ['TEXT_FILL']
  if (path[0] === 'color' && path[1] === 'border') return ['STROKE_COLOR']
  if (path[0] === 'space') return ['GAP']
  if (path[0] === 'radii') return ['CORNER_RADIUS']
  if (path[0] === 'font' && path[1] === 'size') return ['FONT_SIZE']
  if (path[0] === 'font' && path[1] === 'weight') return ['FONT_WEIGHT']
  if (path[0] === 'font' && path[1] === 'lineHeight') return ['LINE_HEIGHT']

  return []
}

StyleDictionary.registerTransform({
  name: 'name/pathToFigma',
  type: 'name',
  transform: (token) => toFigmaPath(token.path),
})

StyleDictionary.registerFormat({
  name: 'figma/variables-json',
  format: ({ dictionary }) => {
    const tokens = dictionary.allTokens.map((token) => {
      const originalValue = token.original.$value
      const aliasMatch =
        typeof originalValue === 'string' ? /^\{([^}]+)\}$/.exec(originalValue) : null
      const sourcePath = token.path.join('.')
      const item = {
        name: token.name,
        type: toFigmaType(token.$type),
        resolvedValue: toFigmaValue(token.$value, token.$type),
        scopes: toScopes(token.path),
        codeSyntax: toCssVariable(token.path),
      }

      if (aliasMatch) {
        item.aliasOf = toFigmaPath(aliasMatch[1].split('.'))
      }

      return [sourcePath, item]
    })

    return `${JSON.stringify(Object.fromEntries(tokens), null, 2)}\n`
  },
})

export default {
  source: ['src/tokens/tokens.json'],
  platforms: {
    css: {
      transformGroup: 'css',
      buildPath: 'src/styles/',
      files: [{ destination: 'tokens.css', format: 'css/variables' }],
    },
    figma: {
      transforms: ['name/pathToFigma'],
      buildPath: 'src/tokens/',
      files: [
        {
          destination: 'tokens.figma.json',
          format: 'figma/variables-json',
          // fontFamily tokens hold a platform-specific web value (e.g. "Geist
          // Variable"); Figma's own font catalog names the same font
          // differently ("Geist"). There's no single value that's correct
          // for both, so this token is intentionally excluded here and kept
          // as a separate, manually-maintained Figma variable instead.
          filter: (token) => token.$type !== 'fontFamily',
        },
      ],
    },
  },
}
