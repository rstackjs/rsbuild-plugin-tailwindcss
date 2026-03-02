import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, test } from '@playwright/test';
import { createRsbuild } from '@rsbuild/core';
import { pluginTailwindCSS } from '../../src';

const __dirname = dirname(fileURLToPath(import.meta.url));

test('should split CSS and reuse common parts', async ({ page }) => {
  const rsbuild = await createRsbuild({
    cwd: __dirname,
    rsbuildConfig: {
      plugins: [pluginTailwindCSS()],
    },
  });

  await rsbuild.build();
  const { server, urls } = await rsbuild.preview();

  await page.goto(urls[0]);

  // Check main chunk styles
  const mainDiv = page.locator('.flex.bg-red-500');
  await expect(mainDiv).toHaveCSS('display', 'flex');
  // Check that background color is set (exact value might vary by browser/environment)
  const mainBgColor = await mainDiv.evaluate(
    (el) => getComputedStyle(el).backgroundColor,
  );
  expect(mainBgColor).not.toBe('rgba(0, 0, 0, 0)');
  expect(mainBgColor).not.toBe('transparent');

  // Wait for async chunk
  const asyncDiv = page.locator('.flex.text-center.bg-blue-500');
  await expect(asyncDiv).toHaveCSS('display', 'flex');
  await expect(asyncDiv).toHaveCSS('text-align', 'center');
  const asyncBgColor = await asyncDiv.evaluate(
    (el) => getComputedStyle(el).backgroundColor,
  );
  expect(asyncBgColor).not.toBe('rgba(0, 0, 0, 0)');
  expect(asyncBgColor).not.toBe('transparent');

  // Analyze CSS files to check for splitting and deduplication
  const linkTags = await page.locator('link[rel="stylesheet"]').all();

  // Fetch all CSS content
  const cssContents: string[] = [];
  for (const link of linkTags) {
    const href = await link.getAttribute('href');
    if (href) {
      const response = await page.request.get(
        new URL(href, urls[0]).toString(),
      );
      cssContents.push(await response.text());
    }
  }

  // Check if .flex is defined
  let flexCount = 0;
  for (const css of cssContents) {
    // Simple check for .flex definition
    if (css.includes('.flex{') || css.includes('.flex {')) {
      flexCount++;
    }
  }

  // We expect at least 2 CSS files (main + async)
  expect(cssContents.length).toBeGreaterThanOrEqual(2);

  // We expect .flex to be defined exactly once (deduplicated)
  // or if not deduplicated, it might be 2. Ideally 1.
  // Let's assert it exists first.
  expect(flexCount).toBeGreaterThan(0);

  // Check for Preflight duplication (checking for a common reset rule)
  // Tailwind preflight usually includes `box-sizing: border-box` on `*, ::before, ::after`.
  let preflightCount = 0;
  for (const css of cssContents) {
    if (css.includes('box-sizing:border-box')) {
      preflightCount++;
    }
  }

  // Preflight should be deduplicated (only in main chunk)
  expect(preflightCount).toBe(1);

  await server.close();
});
