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

    const ids = ['#dedup-a', '#dedup-b', '#dedup-c'] as const;
    const locators = ids.map((selector) => page.locator(selector));

    // All elements share the same utilities and CSS variable-backed color.
    await Promise.all(
      locators.map((locator) => expect(locator).toHaveCSS('display', 'flex')),
    );

    const colors = await Promise.all(
      locators.map((locator) =>
        locator.evaluate((el) => getComputedStyle(el).color),
      ),
    );

    expect(new Set(colors).size).toBe(1);

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

    for (const selector of ['.flex', '.text-brand-dedup']) {
      const pattern = new RegExp(`${selector}\\s*\\{`, 'g');
      const matches = css.match(pattern) ?? [];
      expect(matches.length).toBe(1);
    }
  } finally {
    await server.close();
  }
});
