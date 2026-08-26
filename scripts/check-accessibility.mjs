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
// Each story gets its own page, but pages share one browser process — running
// too many at once would overwhelm a CI runner's CPU/memory for no benefit
// (the wait is network/render time, not CPU time, so a handful in flight is
// enough to hide that latency without fighting each other for resources).
const CONCURRENCY = 4;

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

// Checks one story in its own page. Never throws — a story that fails to
// render or crashes axe is reported as a `crashed` result instead of aborting
// the whole run (see NEVER.md: one story's failure must not take down every
// other story's check).
async function checkStory(context, story) {
  const page = await context.newPage();
  try {
    const url = `http://localhost:${PORT}/iframe.html?id=${story.id}&viewMode=story`;
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    // #storybook-root stays `hidden` with no children until the story has
    // actually rendered — domcontentloaded alone is not a reliable ready
    // signal, so wait for that explicitly instead of the slower and, for
    // this purpose, equally unreliable 'networkidle'.
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
      return { story, status: 'violation', violations: results.violations };
    }
    return { story, status: 'pass' };
  } catch (error) {
    return { story, status: 'crash', error };
  } finally {
    await page.close();
  }
}

// Runs `items` through `worker` with at most `limit` in flight at once —
// stories are network/render-bound, not CPU-bound, so a small worker pool
// hides their latency instead of paying it one story at a time.
async function runWithConcurrency(items, limit, worker) {
  const results = new Array(items.length);
  let next = 0;
  async function runNext() {
    const i = next++;
    if (i >= items.length) return;
    results[i] = await worker(items[i]);
    await runNext();
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, runNext));
  return results;
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

  const failures = [];
  const crashed = [];
  let browser;

  try {
    await waitForServer(`http://localhost:${PORT}`);

    browser = await chromium.launch();
    // One shared context, one page per story — AxeBuilder needs an explicit
    // context (a bare browser.newPage() implicitly creates a throwaway one
    // it can't attach to; verified live, see the commit this comment landed
    // in), and reusing one context across concurrent pages is exactly what
    // Playwright's model expects for parallel checks in a single browser.
    const context = await browser.newContext();

    console.log(`Checking ${stories.length} stories (up to ${CONCURRENCY} at a time)...\n`);

    const results = await runWithConcurrency(stories, CONCURRENCY, (story) => checkStory(context, story));

    for (const result of results) {
      const { story } = result;
      if (result.status === 'violation') {
        console.log(`✖ ${story.title} — ${story.name} (${story.id})`);
        for (const violation of result.violations) {
          console.log(`  [${violation.impact}] ${violation.id}: ${violation.description}`);
          for (const node of violation.nodes) {
            console.log(`    ${node.failureSummary}`);
          }
        }
        failures.push({ story, violations: result.violations });
      } else if (result.status === 'crash') {
        console.log(`✖ ${story.title} — ${story.name} (${story.id}) — check itself crashed: ${result.error.message}`);
        crashed.push({ story, error: result.error });
      } else {
        console.log(`✔ ${story.title} — ${story.name}`);
      }
    }
  } finally {
    if (browser) await browser.close();
    server.kill();
    await rm(serveConfigPath, { force: true });
  }

  // Human-first Markdown report. Whoever reads this is a person looking at a
  // GitHub Issue, not a machine parsing a log — headline first, one screenshot
  // per finding (a contrast problem is instantly obvious in a picture, not in
  // four hex codes), plain-language explanation before the raw axe output.
  // Written unconditionally (finally already ran) so a crashed story never
  // leaves the downstream CI step with no report file to read.
  const lines = [];
  if (failures.length === 0 && crashed.length === 0) {
    lines.push('## ✅ Accessibility-Check bestanden', '', `Alle ${stories.length} Stories ohne Verstoß.`);
  } else {
    lines.push(
      `## ❌ Accessibility-Check: ${failures.length} von ${stories.length} Stories mit Verstoß` +
        (crashed.length > 0 ? `, ${crashed.length} Story-Check(s) abgebrochen` : ''),
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
    for (const { story, error } of crashed) {
      lines.push(
        `### ⚠️ ${story.title} — ${story.name}: Check konnte nicht durchgeführt werden`,
        '',
        `Fehler: \`${error.message}\``,
        '',
        '---',
        ''
      );
    }
  }
  await writeFile('a11y-summary.md', lines.join('\n'));

  const exitCode = failures.length > 0 || crashed.length > 0 ? 1 : 0;
  if (exitCode !== 0) {
    console.log('\nAccessibility violations or crashed checks found — see above and a11y-summary.md.');
  } else {
    console.log('\nNo accessibility violations found.');
  }
  process.exit(exitCode);
}

main().catch(async (error) => {
  // Only unrecoverable setup failures land here now (missing storybook-static,
  // the local static server never coming up, etc.) — per-story failures are
  // caught above and folded into the report instead of crashing the process.
  console.error(error);
  await writeFile(
    'a11y-summary.md',
    `## ❌ Accessibility-Check konnte nicht ausgeführt werden\n\nFehler: \`${error.message}\`\n`
  ).catch(() => {});
  process.exit(1);
});
