#!/usr/bin/env node
// Automated accessibility gate, modeled on GitHub Primer's real `aat-reports.yml`
// (Playwright directly against a built, served Storybook — not the Vitest addon,
// which is blocked by a Rolldown/aria-query interop bug, see Playbook Step 6).
//
// Prints a terse, developer-facing log to stdout (for the CI log), AND writes
// `a11y-summary.md` — a short, human-first report (headline, screenshot per
// violation, plain-language explanation) meant for whoever reads the resulting
// GitHub Issue. The two audiences want different things; this script writes
// for both instead of dumping one raw log at everyone (see Playbook Step 6g).
//
// Usage: node scripts/check-accessibility.mjs
// Assumes `npm run build-storybook` has already produced ./storybook-static.
// Optional env var SCREENSHOT_BASE_URL: if set, screenshots in the Markdown
// report are linked as `${SCREENSHOT_BASE_URL}/<story-id>.png` (used in CI,
// where the workflow publishes screenshots to a hosting branch first). If
// unset, screenshots are referenced by local relative path instead.

import { readFile, writeFile, rm, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { spawn } from 'node:child_process';
import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';

const PORT = 6007;
const STATIC_DIR = 'storybook-static';
const SCREENSHOT_DIR = 'a11y-screenshots';
const SCREENSHOT_BASE_URL = process.env.SCREENSHOT_BASE_URL ?? null;

function waitForServer(url, timeoutMs = 20000) {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    const tryOnce = async () => {
      try {
        const res = await fetch(url);
        if (res.ok) return resolve();
      } catch {
        // not up yet
      }
      if (Date.now() - start > timeoutMs) {
        return reject(new Error(`Server at ${url} did not become ready in time`));
      }
      setTimeout(tryOnce, 300);
    };
    tryOnce();
  });
}

function severityLabel(impact) {
  const labels = { critical: 'Kritisch', serious: 'Schwerwiegend', moderate: 'Mittel', minor: 'Gering' };
  return labels[impact] ?? impact;
}

function screenshotRef(storyId) {
  return SCREENSHOT_BASE_URL ? `${SCREENSHOT_BASE_URL}/${storyId}.png` : `${SCREENSHOT_DIR}/${storyId}.png`;
}

async function main() {
  if (!existsSync(STATIC_DIR)) {
    console.error(`✖ ${STATIC_DIR} not found — run "npm run build-storybook" first.`);
    process.exit(1);
  }

  const index = JSON.parse(await readFile(`${STATIC_DIR}/index.json`, 'utf-8'));
  const stories = Object.values(index.entries).filter((entry) => entry.type === 'story');

  if (stories.length === 0) {
    console.error('✖ No stories found in index.json.');
    process.exit(1);
  }

  // `serve`'s default "clean URLs" behaviour 301-redirects `/iframe.html?id=...`
  // to `/iframe` and drops the query string — Storybook then never learns which
  // story to render (found by inspecting the network response, not guessed).
  const serveConfigPath = `${STATIC_DIR}/serve.json`;
  await writeFile(serveConfigPath, JSON.stringify({ cleanUrls: false }));

  await mkdir(SCREENSHOT_DIR, { recursive: true });

  console.log(`Serving ${STATIC_DIR} on port ${PORT}...`);
  const server = spawn('npx', ['serve', STATIC_DIR, '-l', String(PORT)], {
    stdio: 'ignore',
  });

  let exitCode = 0;
  const failures = [];

  try {
    await waitForServer(`http://localhost:${PORT}`);

    const browser = await chromium.launch();
    const context = await browser.newContext();
    const page = await context.newPage();

    console.log(`Checking ${stories.length} stories...\n`);

    for (const story of stories) {
      const url = `http://localhost:${PORT}/iframe.html?id=${story.id}&viewMode=story`;
      await page.goto(url, { waitUntil: 'networkidle' });
      // #storybook-root stays `hidden` with no children until the story has
      // actually rendered — networkidle alone is not a reliable ready signal.
      await page.waitForFunction(
        () => {
          const root = document.querySelector('#storybook-root');
          return root && !root.hidden && root.childElementCount > 0;
        },
        { timeout: 10000 }
      );

      const results = await new AxeBuilder({ page })
        .disableRules([
          'region', // matches Storybook addon-a11y's own default (region rule doesn't apply to isolated story fragments)
          'landmark-one-main', // page-structure rule — a single component can never have a <main>, that's the page's job, not the component's
          'page-has-heading-one', // same reasoning — no isolated component fragment has (or should have) an <h1>
        ])
        .analyze();

      if (results.violations.length > 0) {
        exitCode = 1;
        const screenshotPath = `${SCREENSHOT_DIR}/${story.id}.png`;
        // Screenshot just the rendered component, not the whole (mostly blank)
        // page or its full-width root container — a tight crop of the actual
        // element makes the problem visible at a glance instead of buried in
        // whitespace.
        const target = page.locator('#storybook-root > *').first();
        if (await target.count() > 0) {
          await target.screenshot({ path: screenshotPath });
        } else {
          await page.screenshot({ path: screenshotPath });
        }

        console.log(`✖ ${story.title} — ${story.name} (${story.id})`);
        for (const violation of results.violations) {
          console.log(`  [${violation.impact}] ${violation.id}: ${violation.description}`);
          for (const node of violation.nodes) {
            console.log(`    ${node.failureSummary}`);
          }
        }

        failures.push({ story, violations: results.violations, screenshotPath });
      } else {
        console.log(`✔ ${story.title} — ${story.name}`);
      }
    }

    await browser.close();
  } finally {
    server.kill();
    await rm(serveConfigPath, { force: true });
  }

  // Human-first Markdown report. Whoever reads this is a person looking at a
  // GitHub Issue, not a machine parsing a log — headline first, one screenshot
  // per finding (a contrast problem is instantly obvious in a picture, not in
  // four hex codes), plain-language explanation before the raw axe output.
  const lines = [];
  if (failures.length === 0) {
    lines.push('## ✅ Accessibility-Check bestanden', '', `Alle ${stories.length} Stories ohne Verstoß.`);
  } else {
    lines.push(
      `## ❌ Accessibility-Check: ${failures.length} von ${stories.length} Stories mit Verstoß`,
      ''
    );
    for (const { story, violations } of failures) {
      lines.push(`### ${story.title} — ${story.name}`, '');
      lines.push(`![${story.name}](${screenshotRef(story.id)})`, '');
      for (const violation of violations) {
        lines.push(`**${severityLabel(violation.impact)}: ${violation.description}**`, '');
        for (const node of violation.nodes) {
          lines.push(`- ${node.failureSummary.replace(/\n/g, ' ')}`);
        }
        lines.push('');
      }
      lines.push(
        `<details><summary>Technische Details (Regel: ${violations.map((v) => v.id).join(', ')})</summary>`,
        '',
        '```',
        JSON.stringify(violations, null, 2),
        '```',
        '',
        '</details>',
        '',
        '---',
        ''
      );
    }
  }
  await writeFile('a11y-summary.md', lines.join('\n'));

  if (exitCode !== 0) {
    console.log('\nAccessibility violations found — see above and a11y-summary.md.');
  } else {
    console.log('\nNo accessibility violations found.');
  }
  process.exit(exitCode);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
