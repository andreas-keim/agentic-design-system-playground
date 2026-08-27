import type { Preview } from '@storybook/react-vite'

import '../src/index.css'

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
       color: /(background|color)$/i,
       date: /Date$/i,
      },
    },

    a11y: {
      // 'off', not 'todo': addon-a11y's own `afterEach` hook runs an automatic
      // axe.run() on every story render regardless of manager UI — confirmed
      // live via the storyFinished channel event, even on a bare iframe.html
      // load. That collides with our own AxeBuilder(page).analyze() call in
      // scripts/check-accessibility.mjs (Step 6c), producing the intermittent
      // "Axe is already running" crash from Issue #1. The `globals.a11y.manual`
      // toggle looked like the targeted fix, but Storybook's URL globals param
      // parses as the string "true", not boolean true, and the addon's guard
      // checks `!== true` strictly — verified live, the automatic run still
      // fired. `test: 'off'` is the one deterministic switch, gated before
      // the globals check, not exposed to that parsing pitfall. Trade-off:
      // the Accessibility panel in Storybook's own UI no longer auto-populates
      // on story load, only on manual "Rerun" click (EVENTS.MANUAL bypasses
      // `test` entirely) — acceptable, since our own CI script is the actual
      // gate now, not this addon's test integration (see Playbook Step 6g).
      test: 'off'
    }
  },
};

export default preview;