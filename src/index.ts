import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import type { RsbuildPlugin } from '@rsbuild/core';
import { cleanupCache } from './compiler.js';
import type { TailwindCSSLoaderOptions } from './loader.js';

const VIRTUAL_UTILITIES_ID = '/virtual-tailwindcss/utilities.css';
const VIRTUAL_GLOBAL_ID = '/virtual-tailwindcss/global.css';

export interface PluginTailwindCSSOptions {
  config?: string;

  theme?: string;
}

export const pluginTailwindCSS = (
  options?: PluginTailwindCSSOptions,
): RsbuildPlugin => ({
  name: 'rsbuild:tailwindcss-v4',

  setup(api) {
    const require = createRequire(import.meta.url);
    const config = options?.config ?? 'tailwind.config.js';
    const theme = options?.theme ?? require.resolve('tailwindcss/theme');
    const preflight = require.resolve('tailwindcss/preflight');
    const utilities = require.resolve('tailwindcss/utilities');

    const resolvedConfigPath = path.isAbsolute(config)
      ? config
      : path.resolve(api.context.rootPath, config);

    const finalConfigPath =
      options?.config || fs.existsSync(resolvedConfigPath)
        ? resolvedConfigPath
        : null;

    api.modifyRsbuildConfig((config, { mergeRsbuildConfig }) => {
      return mergeRsbuildConfig(
        {
          source: {
            preEntry: [pathToFileURL(VIRTUAL_GLOBAL_ID).toString()],
          },
        },
        config,
      );
    });

    api.modifyRspackConfig((_, { rspack, appendPlugins }) =>
      appendPlugins([
        new rspack.experiments.VirtualModulesPlugin({
          [VIRTUAL_GLOBAL_ID]: `\
@layer theme, base, components, utilities;
@import ${JSON.stringify(preflight)} layer(base);
`,
          [VIRTUAL_UTILITIES_ID]: '',
        }),
      ]),
    );

    // 1. Inject
    api.transform(
      {
        test: { and: [/\.(jsx?|tsx?)$/, { not: [/node_modules/] }] },
      },
      ({ code, resourcePath }) => {
        const params = new URLSearchParams({
          path: resourcePath,
        });

        return `\
import "${pathToFileURL(VIRTUAL_UTILITIES_ID)}?${params.toString()}";
${code}`;
      },
    );

    // 2. Extract
    api.modifyBundlerChain((chain) => {
      chain.module
        .rule('tailwindcss')
        .resource(new RegExp(VIRTUAL_UTILITIES_ID.replace(/\//g, '[\\\\/]')))
        .use('tailwindcss')
        .loader(require.resolve('./loader'))
        .options({
          config: finalConfigPath,
          theme,
          utilities,
        } satisfies TailwindCSSLoaderOptions);
    });

    api.onAfterBuild(() => {
      cleanupCache({
        config: finalConfigPath,
        theme,
        utilities,
        base: api.context.rootPath,
      });
    });
  },
});
