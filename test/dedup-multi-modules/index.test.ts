import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { expect, test } from '@playwright/test';
import { createRsbuild } from '@rsbuild/core';

import { pluginTailwindCSS } from '../../src';

const __dirname = dirname(fileURLToPath(import.meta.url));

test('deduplicates utilities across multiple modules', async ({ page }) => {
  const rsbuild = await createRsbuild({
    cwd: __dirname,
    rsbuildConfig: {
      source: {
        entry: {
          index: './src/index.js',
        },
      },
      plugins: [
        pluginTailwindCSS({
          theme: resolve(__dirname, './config/dedup-theme.css'),
        }),
      ],
    },
  });

  await rsbuild.build();
  const { server, urls } = await rsbuild.preview();

  try {
    await page.goto(urls[0]);

    const a = page.locator('#dedup-a');
    const b = page.locator('#dedup-b');
    const c = page.locator('#dedup-c');

    // All elements share the same utilities and CSS variable-backed color.
    await expect(a).toHaveCSS('display', 'flex');
    await expect(b).toHaveCSS('display', 'flex');
    await expect(c).toHaveCSS('display', 'flex');

    const colorA = await a.evaluate((el) => getComputedStyle(el).color);
    const colorB = await b.evaluate((el) => getComputedStyle(el).color);
    const colorC = await c.evaluate((el) => getComputedStyle(el).color);

    expect(colorA).toBe(colorB);
    expect(colorB).toBe(colorC);

    // Fetch the built CSS and assert utilities are only emitted once.
    const cssHref = await page
      .locator('link[rel="stylesheet"]')
      .first()
      .getAttribute('href');

    expect(cssHref).not.toBeNull();

    const response = await page.request.get(
      new URL(cssHref as string, urls[0]).toString(),
    );
    const css = await response.text();

    const flexMatches = css.match(/\.flex\s*\{/g) ?? [];
    const brandMatches = css.match(/\.text-brand-dedup\s*\{/g) ?? [];

    expect(flexMatches.length).toBe(1);
    expect(brandMatches.length).toBe(1);
  } finally {
    await server.close();
  }
});
