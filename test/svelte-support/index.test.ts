import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, test } from '@playwright/test';
import { createRsbuild } from '@rsbuild/core';
import { pluginSvelte } from '@rsbuild/plugin-svelte';
import { pluginTailwindCSS } from '../../src';

const __dirname = dirname(fileURLToPath(import.meta.url));

test('should build Svelte components with tailwind utilities', async ({
  page,
}) => {
  const rsbuild = await createRsbuild({
    cwd: __dirname,
    rsbuildConfig: {
      plugins: [pluginSvelte(), pluginTailwindCSS()],
      html: {
        template: './index.html',
      },
    },
  });

  await rsbuild.build();
  const { server, urls } = await rsbuild.preview();

  await page.goto(urls[0]);

  const locator = page.locator('#test');
  await expect(locator).toHaveCSS('text-align', 'center');
  await expect(locator).toHaveCSS('font-weight', '700');

  // get the color correctly (rgb(239, 68, 68) is red-500)
  const color = await locator.evaluate(
    (el) => window.getComputedStyle(el).color,
  );
  expect(color).toMatch(/lab\(|oklch\(|color\(|rgb\(/);

  await server.close();
});
