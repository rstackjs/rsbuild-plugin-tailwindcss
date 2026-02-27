import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, test } from '@playwright/test';
import { createRsbuild } from '@rsbuild/core';
import { pluginTailwindCSS } from '../../src';

const __dirname = dirname(fileURLToPath(import.meta.url));

test('should not interfere with static asset queries (?url, ?raw)', async ({
  page,
}) => {
  const rsbuild = await createRsbuild({
    cwd: __dirname,
    rsbuildConfig: {
      plugins: [pluginTailwindCSS()],
    },
  });

  await rsbuild.build();
  const { server, urls } = await rsbuild.preview();

  await page.goto(urls[0]);

  const cssUrl = await page.evaluate(() => window.cssUrl);
  const cssRaw = await page.evaluate(() => window.cssRaw);

  // Check ?url
  expect(cssUrl).toMatch(/\.css$/);

  // Check ?raw
  // It should contain the original CSS content, NOT Tailwind's injected content (like @tailwind base etc.)
  expect(cssRaw).toContain('.foo {');
  expect(cssRaw).toContain('color: red;');

  // Ensure it's not empty or undefined
  expect(cssRaw).toBeTruthy();

  await server.close();
});
