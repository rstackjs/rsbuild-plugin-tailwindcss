import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { expect, test } from '@playwright/test';
import { createRsbuild } from '@rsbuild/core';

import { pluginTailwindCSS } from '../../src';

const __dirname = dirname(fileURLToPath(import.meta.url));

test('supports CSS directives (@apply, @utility, @variant, @custom-variant)', async ({
  page,
}) => {
  const rsbuild = await createRsbuild({
    cwd: __dirname,
    rsbuildConfig: {
      plugins: [pluginTailwindCSS()],
    },
  });

  const { close } = await rsbuild.build();
  const { server, urls } = await rsbuild.preview();

  try {
    await page.goto(urls[0]);

    // @apply turns the `.btn` utility into real CSS.
    await expect(page.locator('#apply-test')).toHaveCSS('display', 'flex');

    // @utility registers custom utilities that can be used from HTML.
    await expect(page.locator('#utility-test')).toHaveCSS(
      'outline-style',
      'solid',
    );

    // @custom-variant + Tailwind utilities (theme-midnight:bg-black).
    await expect(page.locator('#custom-variant-utility')).toHaveCSS(
      'background-color',
      'rgb(0, 0, 0)',
    );

    // @variant used with a custom variant defined via @custom-variant.
    await expect(page.locator('#custom-variant-css')).toHaveCSS(
      'color',
      'rgb(0, 0, 255)',
    );

    // @variant hover used inside custom CSS.
    const card = page.locator('#variant-test');
    await card.hover();
    await expect(card).toHaveCSS('background-color', 'rgb(0, 0, 0)');
  } finally {
    await server.close();
    await close();
  }
});
