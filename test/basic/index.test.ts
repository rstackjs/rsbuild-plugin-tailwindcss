import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, test } from '@playwright/test';
import { createRsbuild } from '@rsbuild/core';
import { pluginTailwindCSS } from '../../src';

const __dirname = dirname(fileURLToPath(import.meta.url));

test('should build with tailwind utilities', async ({ page }) => {
  const rsbuild = await createRsbuild({
    cwd: __dirname,
    rsbuildConfig: {
      plugins: [pluginTailwindCSS()],
    },
  });

  await rsbuild.build();
  const { server, urls } = await rsbuild.preview();

  await page.goto(urls[0]);

  await expect(page.locator('#test')).toHaveCSS('display', 'flex');

  await server.close();
});

test('preflight base styles are applied from virtual global CSS', async ({
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

    await page.evaluate(() => {
      const button = document.createElement('button');
      button.id = 'preflight-button';
      button.textContent = 'Button';
      document.body.appendChild(button);

      const list = document.createElement('ul');
      list.id = 'preflight-list';
      const item = document.createElement('li');
      item.textContent = 'Item';
      list.appendChild(item);
      document.body.appendChild(list);
    });

    await expect(page.locator('body')).toHaveCSS('margin', '0px');
    await expect(page.locator('#preflight-button')).toHaveCSS(
      'border-radius',
      '0px',
    );
    await expect(page.locator('#preflight-button')).toHaveCSS(
      'background-color',
      'rgba(0, 0, 0, 0)',
    );
    await expect(page.locator('#preflight-list')).toHaveCSS(
      'list-style-type',
      'none',
    );
  } finally {
    await server.close();
  }
});

test('layer order controls which styles win across layers', async ({
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

    await page.addStyleTag({
      content: `@layer utilities {
  #layer-order-test { color: red; }
}

@layer base {
  #layer-order-test { color: blue; }
}
`,
    });

    await page.evaluate(() => {
      const el = document.createElement('div');
      el.id = 'layer-order-test';
      el.textContent = 'Layer order';
      document.body.appendChild(el);
    });

    await expect(page.locator('#layer-order-test')).toHaveCSS(
      'color',
      'rgb(255, 0, 0)',
    );
  } finally {
    await server.close();
  }
});

test('should not generate tailwind.config.js in dist/', async () => {
  const rsbuild = await createRsbuild({
    cwd: __dirname,
    rsbuildConfig: {
      plugins: [pluginTailwindCSS()],
    },
  });

  await rsbuild.build();

  expect(existsSync(resolve(__dirname, './dist/.rsbuild'))).toBeFalsy();
});
