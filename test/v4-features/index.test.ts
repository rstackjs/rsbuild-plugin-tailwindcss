import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, test } from '@playwright/test';
import { createRsbuild } from '@rsbuild/core';
import { pluginTailwindCSS } from '../../src';

const __dirname = dirname(fileURLToPath(import.meta.url));

test('should support Tailwind CSS v4 features', async ({ page }) => {
  const rsbuild = await createRsbuild({
    cwd: __dirname,
    rsbuildConfig: {
      plugins: [pluginTailwindCSS()],
    },
  });

  await rsbuild.build();
  const { server, urls } = await rsbuild.preview();

  await page.goto(urls[0]);

  // 1. Test !important modifier
  const important = page.locator('#important');
  await expect(important).toHaveCSS('display', 'flex');

  // 2. Test 3D transforms
  const transform = page.locator('#transform');
  await expect(transform).toHaveCSS('perspective', '500px');
  // Check for rotateX in transform. Computed value is usually a matrix.
  await expect(transform).not.toHaveCSS('transform', 'none');

  // 3. Test Container Queries
  const containerItem = page.locator('#container-item');
  // In v4, colors might be returned as lab/oklch depending on browser support.
  // We accept the lab value seen in tests or the rgb fallback if environment differs.
  // Received: "lab(55.4814 75.0732 48.8528)"
  const color = await containerItem.evaluate(
    (el) => getComputedStyle(el).color,
  );
  expect(color).toMatch(
    /^(rgb\(239, 68, 68\)|lab\(55\.4814 75\.0732 48\.8528\)|oklch\(0\.637 0\.237 25\.331\))$/,
  );

  await server.close();
});
