import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, test } from '@playwright/test';
import { createRsbuild } from '@rsbuild/core';

const __dirname = dirname(fileURLToPath(import.meta.url));

test('should build with excluded modules', async ({ page }) => {
  const { pluginTailwindCSS } = await import('../../src');
  const rsbuild = await createRsbuild({
    cwd: __dirname,
    rsbuildConfig: {
      plugins: [
        pluginTailwindCSS({
          exclude: ['./src/exclude.js'],
        }),
      ],
    },
  });

  await rsbuild.build();
  const { server, urls } = await rsbuild.preview();

  await page.goto(urls[0]);

  const display = await page
    .locator('#test')
    .evaluate((el) =>
      window.getComputedStyle(el).getPropertyValue('display'),
    );

  expect(display).toBe('flex');

  const textAlign = await page
    .locator('#exclude')
    .evaluate((el) =>
      window.getComputedStyle(el).getPropertyValue('text-align'),
    );

  expect(textAlign).not.toBe('center');

  // The `not-exclude.js` imported by `exclude.js` should not be excluded.
  const paddingTop = await page
    .locator('#not-exclude')
    .evaluate((el) =>
      window.getComputedStyle(el).getPropertyValue('padding-top'),
    );

  expect(paddingTop).toBe('16px');

  await server.close();
});
