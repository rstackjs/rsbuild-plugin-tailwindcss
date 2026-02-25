import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { expect, test } from '@playwright/test';
import { createRsbuild } from '@rsbuild/core';

import { pluginTailwindCSS } from '../../src';
import { supportESM } from '../helper';

const __dirname = dirname(fileURLToPath(import.meta.url));

test('theme', async ({ page }) => {
  test.skip(
    !supportESM(),
    'Skip since the tailwindcss version does not support ESM configuration',
  );

  const rsbuild = await createRsbuild({
    cwd: __dirname,
    rsbuildConfig: {
       plugins: [
         pluginTailwindCSS({
           config: './config/tailwind.config.js',
         }),
       ],
     },
   });

  await rsbuild.build();
  const { server, urls } = await rsbuild.preview();

  try {
    await page.goto(urls[0]);
    const color = await page
      .locator('#test')
      .evaluate((el) =>
        window.getComputedStyle(el).getPropertyValue('color'),
      );

    expect(color).toBe('rgb(1, 2, 3)');
  } finally {
    await server.close();
  }
});
