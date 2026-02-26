import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { expect, test } from '@playwright/test';
import { createRsbuild } from '@rsbuild/core';

import { pluginTailwindCSS } from '../../src';

const __dirname = dirname(fileURLToPath(import.meta.url));

test('arbitrary values: bg-[color:...] and py-[calc(--spacing(4)-1px)]', async ({
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

  try {
    await page.goto(urls[0]);

    const bgLocator = page.locator('#bg-arbitrary-test');
    const spacingLocator = page.locator('#spacing-arbitrary-test');

    // bg-[color:var(--arbitrary-bg-color)] should resolve the CSS variable
    // and apply it as the background color.
    await expect(bgLocator).toHaveCSS('background-color', 'rgb(1, 2, 3)');

    // In the default theme, --spacing(4) evaluates to 16px (see the
    // functions test that asserts margin-top: 16px for --spacing(4)).
    // py-[calc(--spacing(4)-1px)] should therefore result in 15px
    // vertical padding on both sides.
    await expect(spacingLocator).toHaveCSS('padding-top', '15px');
    await expect(spacingLocator).toHaveCSS('padding-bottom', '15px');
  } finally {
    await server.close();
  }
});
