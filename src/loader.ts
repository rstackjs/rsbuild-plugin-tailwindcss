import path from 'node:path';
import type { Rspack } from '@rsbuild/core';
import { Scanner } from '@tailwindcss/oxide';
import { getCompiler } from './compiler.js';

export interface TailwindCSSLoaderOptions {
  config: string | null;
  theme: string;
  utilities: string;
}

export default async function tailwindCSSLoader(
  this: Rspack.LoaderContext<TailwindCSSLoaderOptions>,
): Promise<string> {
  const params = new URLSearchParams(this.resourceQuery?.slice(1) ?? '');
  const filePath = params.get('path');

  if (!filePath) {
    return '';
  }

  // Ensure changes to the source file trigger rebuilds.
  this.addDependency(filePath);

  const { config, theme, utilities } = this.getOptions();

  const { compiler, fullRebuildPaths } = await getCompiler({
    base: this.rootContext,
    config,
    theme,
    utilities,
  });

  for (const dep of fullRebuildPaths) {
    this.addDependency(dep);
  }
  if (config) {
    this.addDependency(config);
  }

  // Scan only the current source file for class candidates.
  const scanner = new Scanner({
    sources: [
      {
        base: path.dirname(filePath),
        pattern: path.basename(filePath),
        negated: false,
      },
    ],
  });

  const candidates = scanner.scan();

  const css = compiler.build(candidates);

  return css;
}
