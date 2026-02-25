import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, test } from '@playwright/test';
import { createRsbuild } from '@rsbuild/core';

const __dirname = dirname(fileURLToPath(import.meta.url));

test('should build with included and excluded modules', async ({ page }) => {
  const { pluginTailwindCSS } = await import('../../src');
  const rsbuild = await createRsbuild({
    cwd: __dirname,
    rsbuildConfig: {
      plugins: [
        pluginTailwindCSS({
          include: './src/*.{js,jsx}',
          exclude: './src/exclude.js',
        }),
      ],
    },
  });

  await rsbuild.build();
  const { server, urls } = await rsbuild.preview();

  await page.goto(urls[0]);

  await expect(page.locator('#test')).toHaveCSS('display', 'flex');

  // Exclude
  await expect(page.locator('#exclude')).not.toHaveCSS('text-align', 'center');

  // The `not-exclude.js` imported by `exclude.js` should not be excluded.
  await expect(page.locator('#not-exclude')).toHaveCSS('padding-top', '16px');

  // Include
  await expect(page.locator('#not-include')).not.toHaveCSS(
    'text-align',
    'center',
  );

  // The `include.js` imported by `not-include.ts` should be included.
  await expect(page.locator('#include')).toHaveCSS('padding-top', '16px');
  await server.close();
});
