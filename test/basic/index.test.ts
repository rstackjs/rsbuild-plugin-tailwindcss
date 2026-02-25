import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, test } from '@playwright/test';
import { createRsbuild } from '@rsbuild/core';
import { pluginTailwindCSS } from '../../src';

const __dirname = dirname(fileURLToPath(import.meta.url));

test('should dev with tailwind utilities', async ({ page }) => {
  const rsbuild = await createRsbuild({
    cwd: __dirname,
    rsbuildConfig: {
      plugins: [pluginTailwindCSS()],
    },
  });

  const { server, urls } = await rsbuild.startDevServer();

  await page.goto(urls[0]);

  await expect(page.locator('#test')).toHaveCSS('display', 'flex');

  await server.close();
});

test('should build with tailwind utilities', async ({ page }) => {
  const rsbuild = await createRsbuild({
    cwd: __dirname,
    rsbuildConfig: {
      plugins: [pluginTailwindCSS()],
    },
  });

  await rsbuild.build();
  const { server, urls } = await rsbuild.preview();

  await page.goto(urls[0]);

  await expect(page.locator('#test')).toHaveCSS('display', 'flex');

  await server.close();
});

test('should not generate tailwind.config.js in dist/', async () => {
  const rsbuild = await createRsbuild({
    cwd: __dirname,
    rsbuildConfig: {
      plugins: [pluginTailwindCSS()],
    },
  });

  await rsbuild.build();

  expect(existsSync(resolve(__dirname, './dist/.rsbuild'))).toBeFalsy();
});

test('should dev with nested entry', async ({ page }) => {
  const rsbuild = await createRsbuild({
    cwd: __dirname,
    rsbuildConfig: {
      source: {
        entry: {
          'nested/output/folder/bundle': resolve(__dirname, './src/index.js'),
        },
      },
      plugins: [pluginTailwindCSS()],
    },
  });

  const { server, urls } = await rsbuild.startDevServer();

  await page.goto(`${urls[0]}/nested/output/folder/bundle`);

  await expect(page.locator('#test')).toHaveCSS('display', 'flex');

  await server.close();
});
