import { defineConfig } from '@rslib/core';

export default defineConfig({
  lib: [{ format: 'esm', syntax: ['node 22'], dts: true }],
  source: {
    entry: {
      index: './src/index.ts',
      loader: './src/loader.ts',
    },
  },
});
