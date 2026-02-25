import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, test } from '@playwright/test';
import { createRsbuild } from '@rsbuild/core';
import { pluginTailwindCSS } from '../../src';

const __dirname = dirname(fileURLToPath(import.meta.url));

test('should dev with resource query on rspack', async ({ page }) => {
  const rsbuild = await createRsbuild({
    cwd: __dirname,
    rsbuildConfig: {
      source: {
        entry: {
          index: resolve(__dirname, './src/index.js?entry'),
        },
      },
      plugins: [pluginTailwindCSS()],
    },
  });

  const { server, urls } = await rsbuild.startDevServer();

  await page.goto(urls[0]);
  const display = await page
    .locator('#test')
    .evaluate((el) =>
      window.getComputedStyle(el).getPropertyValue('display'),
    );

  expect(display).toBe('flex');

  await server.close();
});

test('should build with resource query on rspack', async ({ page }) => {
  const rsbuild = await createRsbuild({
    cwd: __dirname,
    rsbuildConfig: {
      source: {
        entry: {
          index: resolve(__dirname, './src/index.js?entry'),
        },
      },
      plugins: [pluginTailwindCSS()],
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

  await server.close();
});
