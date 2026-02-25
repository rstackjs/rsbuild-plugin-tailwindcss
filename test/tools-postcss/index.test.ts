import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, test } from '@playwright/test';
import { createRsbuild } from '@rsbuild/core';
import { pluginTailwindCSS } from '../../src';

const __dirname = dirname(fileURLToPath(import.meta.url));

test('should build with tools.postcss with tailwindcss', async ({ page }) => {
  const { default: tailwindcss } = await import('tailwindcss');
  const rsbuild = await createRsbuild({
    cwd: __dirname,
    rsbuildConfig: {
      plugins: [pluginTailwindCSS()],
      tools: {
        postcss: {
          postcssOptions: {
            plugins: [tailwindcss()],
          },
        },
      },
    },
  });

  await rsbuild.build();
  const { server, urls } = await rsbuild.preview();

  await page.goto(urls[0]);

  await expect(page.locator('#test')).toHaveCSS('display', 'flex');

  await server.close();
});

test('should build with tools.postcss with custom plugin', async ({ page }) => {
  const { default: tailwindcss } = await import('tailwindcss');
  const { default: flexToGrid } = await import('./flex-to-grid.js');
  const rsbuild = await createRsbuild({
    cwd: __dirname,
    rsbuildConfig: {
      plugins: [pluginTailwindCSS()],
      tools: {
        postcss: {
          postcssOptions: {
            plugins: [flexToGrid()],
          },
        },
      },
    },
  });

  await rsbuild.build();
  const { server, urls } = await rsbuild.preview();

  await page.goto(urls[0]);

  await expect(page.locator('#test')).toHaveCSS('display', 'grid');

  await server.close();
});
