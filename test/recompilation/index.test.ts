import fs from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, test } from '@playwright/test';
import { createRsbuild } from '@rsbuild/core';
import { pluginTailwindCSS } from '../../src';

const __dirname = dirname(fileURLToPath(import.meta.url));
const themePath = join(__dirname, 'src/theme.css');

test('should update styles when theme file changes', async ({ page }) => {
  // Reset theme file
  fs.writeFileSync(
    themePath,
    `
    @theme {
      --color-dynamic: rgb(1, 2, 3);
    }
  `,
  );

  const rsbuild = await createRsbuild({
    cwd: __dirname,
    rsbuildConfig: {
      plugins: [pluginTailwindCSS()],
    },
  });

  // First build
  await rsbuild.build();
  let result = await rsbuild.preview();

  await page.goto(result.urls[0]);
  let locator = page.locator('#dynamic');
  await expect(locator).toHaveCSS('background-color', 'rgb(1, 2, 3)');
  await result.server.close();

  // Modify theme file
  fs.writeFileSync(
    themePath,
    `
    @theme {
      --color-dynamic: rgb(4, 5, 6);
    }
  `,
  );

  // Second build (reusing instance if possible, or creating new one if that's how tests work)
  // The user asked to "Same createRsbuild instance" if possible.
  // rsbuild.build() runs the build.
  // We can run it again.
  await rsbuild.build();
  result = await rsbuild.preview(); // New preview server

  await page.goto(result.urls[0]);
  locator = page.locator('#dynamic');
  await expect(locator).toHaveCSS('background-color', 'rgb(4, 5, 6)');
  await result.server.close();
});
