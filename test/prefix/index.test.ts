import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { expect, test } from '@playwright/test';
import { createRsbuild } from '@rsbuild/core';

import { pluginTailwindCSS } from '../../src';
import { getRandomPort, supportESM } from '../helper';

const __dirname = dirname(fileURLToPath(import.meta.url));

test('prefix', async ({ page }) => {
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
      server: {
        port: getRandomPort(),
      },
    },
  });

  await rsbuild.build();
  const { server, urls } = await rsbuild.preview();

  try {
    await page.goto(urls[0]);
    await page.waitForSelector('#test', { state: 'attached' });

    const display = await page.evaluate(() => {
      const el = document.getElementById('test');

      if (!el) {
        throw new Error('#test not found');
      }

      return window.getComputedStyle(el).getPropertyValue('display');
    });

    expect(display).toBe('flex');
  } finally {
    await server.close();
  }
});
