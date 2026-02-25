import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import test, { expect } from '@playwright/test';
import { createRsbuild } from '@rsbuild/core';

import { pluginTailwindCSS } from '../../src';

const __dirname = dirname(fileURLToPath(import.meta.url));

test('should dev with tailwind utilities in multiple entries', async ({
  page,
}) => {
  const rsbuild = await createRsbuild({
    cwd: __dirname,
    rsbuildConfig: {
      dev: {
        writeToDisk: true,
      },
      source: {
        entry: {
          a: './a.js',
          b: './b.js',
          c: './c.js',
          d: './d.js',
          e: './e.js',
        },
      },
      plugins: [pluginTailwindCSS()],
    },
  });

  const { server, urls } = await rsbuild.startDevServer();

  await page.goto(`${urls[0]}/a`);
  const locator = page.locator('#test');
  await expect(locator).toHaveCSS('display', 'flex'); // flex
  await expect(locator).not.toHaveCSS('width', '32px'); // w-8
  await expect(locator).not.toHaveCSS('padding-left', '0'); // px-4
  await expect(locator).not.toHaveCSS('padding-right', '0'); // px-4
  await expect(locator).not.toHaveCSS('z-index', '20'); // z-20
  await expect(locator).not.toHaveCSS('justify-content', 'flex-end'); // justify-end

  await page.goto(`${urls[0]}/b`);
  await expect(locator).not.toHaveCSS('display', 'flex'); // flex
  await expect(locator).toHaveCSS('width', '32px'); // w-8
  await expect(locator).not.toHaveCSS('padding-left', '0'); // px-4
  await expect(locator).not.toHaveCSS('padding-right', '0'); // px-4
  await expect(locator).not.toHaveCSS('z-index', '20'); // z-20
  await expect(locator).not.toHaveCSS('justify-content', 'flex-end'); // justify-end

  await page.goto(`${urls[0]}/c`);
  await expect(locator).not.toHaveCSS('display', 'flex'); // flex
  await expect(locator).not.toHaveCSS('width', '32px'); // w-8
  await expect(locator).toHaveCSS('padding-left', '16px'); // px-4
  await expect(locator).toHaveCSS('padding-right', '16px'); // px-4
  await expect(locator).not.toHaveCSS('z-index', '20'); // z-20
  await expect(locator).not.toHaveCSS('justify-content', 'flex-end'); // justify-end

  await page.goto(`${urls[0]}/d`);
  await expect(locator).not.toHaveCSS('display', 'flex'); // flex
  await expect(locator).not.toHaveCSS('width', '32px'); // w-8
  await expect(locator).not.toHaveCSS('padding-left', '0'); // px-4
  await expect(locator).not.toHaveCSS('padding-right', '0'); // px-4
  await expect(locator).toHaveCSS('z-index', '20'); // z-20
  await expect(locator).not.toHaveCSS('justify-content', 'flex-end'); // justify-end

  await page.goto(`${urls[0]}/e`);
  await expect(locator).not.toHaveCSS('display', 'flex'); // flex
  await expect(locator).not.toHaveCSS('width', '32px'); // w-8
  await expect(locator).not.toHaveCSS('padding-left', '0'); // px-4
  await expect(locator).not.toHaveCSS('padding-right', '0'); // px-4
  await expect(locator).not.toHaveCSS('z-index', '20'); // z-20
  await expect(locator).toHaveCSS('justify-content', 'flex-end'); // justify-end

  await server.close();
});

test('should build with tailwind utilities in multiple entries', async ({
  page,
}) => {
  const rsbuild = await createRsbuild({
    cwd: __dirname,
    rsbuildConfig: {
      source: {
        entry: {
          a: './a.js',
          b: './b.js',
          c: './c.js',
          d: './d.js',
          e: './e.js',
        },
      },
      plugins: [pluginTailwindCSS()],
    },
  });

  await rsbuild.build();
  const { server, urls } = await rsbuild.preview();

  await page.goto(`${urls[0]}/a`);
  const locator = page.locator('#test');
  await expect(locator).toHaveCSS('display', 'flex'); // flex
  await expect(locator).not.toHaveCSS('width', '32px'); // w-8
  await expect(locator).not.toHaveCSS('padding-left', '0'); // px-4
  await expect(locator).not.toHaveCSS('padding-right', '0'); // px-4
  await expect(locator).not.toHaveCSS('z-index', '20'); // z-20
  await expect(locator).not.toHaveCSS('justify-content', 'flex-end'); // justify-end

  await page.goto(`${urls[0]}/b`);
  await expect(locator).not.toHaveCSS('display', 'flex'); // flex
  await expect(locator).toHaveCSS('width', '32px'); // w-8
  await expect(locator).not.toHaveCSS('padding-left', '0'); // px-4
  await expect(locator).not.toHaveCSS('padding-right', '0'); // px-4
  await expect(locator).not.toHaveCSS('z-index', '20'); // z-20
  await expect(locator).not.toHaveCSS('justify-content', 'flex-end'); // justify-end

  await page.goto(`${urls[0]}/c`);
  await expect(locator).not.toHaveCSS('display', 'flex'); // flex
  await expect(locator).not.toHaveCSS('width', '32px'); // w-8
  await expect(locator).toHaveCSS('padding-left', '16px'); // px-4
  await expect(locator).toHaveCSS('padding-right', '16px'); // px-4
  await expect(locator).not.toHaveCSS('z-index', '20'); // z-20
  await expect(locator).not.toHaveCSS('justify-content', 'flex-end'); // justify-end

  await page.goto(`${urls[0]}/d`);
  await expect(locator).not.toHaveCSS('display', 'flex'); // flex
  await expect(locator).not.toHaveCSS('width', '32px'); // w-8
  await expect(locator).not.toHaveCSS('padding-left', '0'); // px-4
  await expect(locator).not.toHaveCSS('padding-right', '0'); // px-4
  await expect(locator).toHaveCSS('z-index', '20'); // z-20
  await expect(locator).not.toHaveCSS('justify-content', 'flex-end'); // justify-end

  await page.goto(`${urls[0]}/e`);
  await expect(locator).not.toHaveCSS('display', 'flex'); // flex
  await expect(locator).not.toHaveCSS('width', '32px'); // w-8
  await expect(locator).not.toHaveCSS('padding-left', '0'); // px-4
  await expect(locator).not.toHaveCSS('padding-right', '0'); // px-4
  await expect(locator).not.toHaveCSS('z-index', '20'); // z-20
  await expect(locator).toHaveCSS('justify-content', 'flex-end'); // justify-end

  await server.close();
});
