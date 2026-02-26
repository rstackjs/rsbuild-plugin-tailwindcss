import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { expect, test } from '@playwright/test';
import { createRsbuild } from '@rsbuild/core';

import { pluginTailwindCSS } from '../../src';

const __dirname = dirname(fileURLToPath(import.meta.url));

test('build-time functions --alpha() and --spacing()', async ({ page }) => {
  const rsbuild = await createRsbuild({
    cwd: __dirname,
    rsbuildConfig: {
      plugins: [
        pluginTailwindCSS({
          theme: resolve(__dirname, './config/functions-theme.css'),
        }),
      ],
    },
  });

  await rsbuild.build();
  const { server, urls } = await rsbuild.preview();

  try {
    await page.goto(urls[0]);

    const alphaLocator = page.locator('#alpha-test');
    const spacingLocator = page.locator('#spacing-test');

    const alphaColor = await alphaLocator.evaluate((el) => {
      return window.getComputedStyle(el).color;
    });

    // In Chromium today --alpha(var(--color-functions-alpha) / 50%)
    // serializes as an `oklab(...)` color with `/ 0.5` alpha.
    // Assert the full structure (color space + explicit 0.5 alpha)
    // instead of just checking that it "contains" a substring.
    expect(alphaColor).toMatch(/^oklab\([^)]*\/ 0\.5\)$/);

    await expect(spacingLocator).toHaveCSS('margin-top', '16px');
  } finally {
    await server.close();
  }
});
