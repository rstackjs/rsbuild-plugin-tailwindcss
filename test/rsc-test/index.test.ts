import fs from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, test } from '@playwright/test';
import { createRsbuild } from '@rsbuild/core';
import { pluginTailwindCSS } from '../../src';

const __dirname = dirname(fileURLToPath(import.meta.url));

test('should preserve "use client" directive at the top of the file', async () => {
  const rsbuild = await createRsbuild({
    cwd: __dirname,
    rsbuildConfig: {
      plugins: [pluginTailwindCSS()],
      output: {
        minify: false,
      },
    },
  });

  await rsbuild.build();

  const distPath = resolve(__dirname, './dist/static/js');
  const files = fs.readdirSync(distPath);
  const mainFile = files.find((f) => f.endsWith('.js'));
  if (!mainFile) {
    throw new Error('No JS file found');
  }
  const content = fs.readFileSync(resolve(distPath, mainFile), 'utf-8');

  // "use client" should be present in the output
  expect(content).toMatch(/['"]use client['"]/);
});
