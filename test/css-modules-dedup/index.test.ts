import fs from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, test } from '@playwright/test';
import { createRsbuild } from '@rsbuild/core';
import { pluginTailwindCSS } from '../../src';

const __dirname = dirname(fileURLToPath(import.meta.url));

test('deduplicates theme variables in multiple CSS modules', async () => {
  const rsbuild = await createRsbuild({
    cwd: __dirname,
    rsbuildConfig: {
      plugins: [pluginTailwindCSS()],
    },
  });

  await rsbuild.build();

  const cssDir = join(__dirname, 'dist/static/css');
  const cssFiles = fs.readdirSync(cssDir).filter((f) => f.endsWith('.css'));
  const cssContent = fs.readFileSync(join(cssDir, cssFiles[0]), 'utf-8');

  // If theme was injected via @import, does it result in duplicated variables?
  // We'll count the number of times `--spacing` or some known theme variable appears.
  const rootMatches = cssContent.match(/:root/g) || [];
  expect(rootMatches.length).toBeLessThan(2);
});
