import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, test } from '@playwright/test';
import { createRsbuild } from '@rsbuild/core';
import { pluginTailwindCSS } from '../../src';

const __dirname = dirname(fileURLToPath(import.meta.url));

test('should fail with clear error when config file is missing', async () => {
  const rsbuild = await createRsbuild({
    cwd: __dirname,
    rsbuildConfig: {
      plugins: [
        pluginTailwindCSS({
          config: './does-not-exist.js',
        }),
      ],
    },
  });

  // We expect the build to fail
  try {
    await rsbuild.build();
    throw new Error('Build was expected to fail, but it succeeded.');
  } catch (err: unknown) {
    const error = err as Error;
    // Check for error message
    // Rsbuild might wrap the error, so we check for generic failure or specific message
    expect(error.message).toMatch(
      /Rspack build failed|Cannot find module|ENOENT|no such file/i,
    );
  }
});
