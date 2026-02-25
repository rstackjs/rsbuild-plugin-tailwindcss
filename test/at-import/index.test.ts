import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { expect, test } from '@playwright/test';
import { createRsbuild } from '@rsbuild/core';

import { pluginTailwindCSS } from '../../src';

const __dirname = dirname(fileURLToPath(import.meta.url));

test('theme via CSS file with nested @import', async ({ page }) => {
  const rsbuild = await createRsbuild({
    cwd: __dirname,
    rsbuildConfig: {
      plugins: [
        pluginTailwindCSS({
          theme: resolve(__dirname, './config/app-theme.css'),
        }),
      ],
    },
  });

  const { close } = await rsbuild.build();
  const { server, urls } = await rsbuild.preview();

  try {
    await page.goto(urls[0]);
    await expect(page.locator('#at-import-test')).toHaveCSS(
      'color',
      'rgb(1, 2, 5)',
    );
  } finally {
    await server.close();
    await close();
  }
});

test('import plain CSS from entry', async ({ page }) => {
  const rsbuild = await createRsbuild({
    cwd: __dirname,
    rsbuildConfig: {
      plugins: [
        pluginTailwindCSS({
          theme: resolve(__dirname, './config/app-theme.css'),
        }),
      ],
    },
  });

  const { close } = await rsbuild.build();
  const { server, urls } = await rsbuild.preview();

  try {
    await page.goto(urls[0]);
    await expect(page.locator('#plain-css-import-test')).toHaveCSS(
      'color',
      'rgb(17, 34, 51)',
    );
  } finally {
    await server.close();
    await close();
  }
});

test('import plain CSS via theme @import chain', async ({ page }) => {
  const rsbuild = await createRsbuild({
    cwd: __dirname,
    rsbuildConfig: {
      plugins: [
        pluginTailwindCSS({
          theme: resolve(__dirname, './config/app-theme.css'),
        }),
      ],
    },
  });

  const { close } = await rsbuild.build();
  const { server, urls } = await rsbuild.preview();

  try {
    await page.goto(urls[0]);
    await expect(page.locator('#theme-plain-css-test')).toHaveCSS(
      'color',
      'rgb(34, 0, 68)',
    );
  } finally {
    await server.close();
    await close();
  }
});
