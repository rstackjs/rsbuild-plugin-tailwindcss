import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, test } from '@playwright/test';
import { createRsbuild } from '@rsbuild/core';
import { pluginVue } from '@rsbuild/plugin-vue';
import { pluginTailwindCSS } from '../../src';

const __dirname = dirname(fileURLToPath(import.meta.url));

test('should build with vue', async ({ page }) => {
  const rsbuild = await createRsbuild({
    cwd: __dirname,
    rsbuildConfig: {
      plugins: [pluginVue(), pluginTailwindCSS()],
    },
  });

  await rsbuild.build();
  const { server, urls } = await rsbuild.preview();
  await page.goto(urls[0]);

  const locator = page.locator('#test');
  await expect(locator).toHaveCSS('display', 'flex');
  // Tailwind v4 uses oklch colors by default
  const color = await locator.evaluate(
    (el) => window.getComputedStyle(el).color,
  );
  expect(color).toMatch(/lab\(|oklch\(|color\(|rgb\(/);

  await server.close();
});
