import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, test } from '@playwright/test';
import { createRsbuild } from '@rsbuild/core';
import { pluginTailwindCSS } from '../../src';

const __dirname = dirname(fileURLToPath(import.meta.url));

test('should handle @reference directive correctly in CSS modules', async ({
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

  const locator = page.locator('#test-div');
  // Check if the custom color defined in theme.css is applied via @apply in the module
  await expect(locator).toHaveCSS('background-color', 'rgb(18, 52, 86)'); // #123456

  await server.close();
});
