import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import type { RsbuildPlugin } from '@rsbuild/core';
import { cleanupCache } from './compiler.js';
import type { TailwindCSSLoaderOptions } from './loader.js';
import { tailwindPostCSSPlugins } from './postcss.js';

const VIRTUAL_UTILITIES_ID = '/virtual-tailwindcss/utilities.css';
const VIRTUAL_GLOBAL_ID = '/virtual-tailwindcss/global.css';

export interface PluginTailwindCSSOptions {
  /**
   * The path to the Tailwind CSS configuration file.
   *
   * @remarks
   * If a relative path is provided, it is resolved from the rsbuild root
   * (`api.context.rootPath`). When omitted, the plugin will look for
   * `tailwind.config.js` in the project root. If the file does not exist,
   * Tailwind will run with its default configuration.
   *
   * @example
   *
   * Use a config file in a custom folder:
   *
   * ```js
   * // rsbuild.config.ts
   * import { pluginTailwindCSS } from 'rsbuild-plugin-tailwindcss'
   *
   * export default {
   *   plugins: [
   *     pluginTailwindCSS({
   *       config: './config/tailwind.config.js',
   *     }),
   *   ],
   * }
   * ```
   *
   * @example
   *
   * Use an absolute config path:
   *
   * ```js
   * // rsbuild.config.ts
   * import path from 'node:path'
   * import { fileURLToPath } from 'node:url'
   * import { pluginTailwindCSS } from 'rsbuild-plugin-tailwindcss'
   *
   * const __dirname = path.dirname(fileURLToPath(import.meta.url))
   *
   * export default {
   *   plugins: [
   *     pluginTailwindCSS({
   *       config: path.resolve(__dirname, './tailwind.config.js'),
   *     }),
   *   ],
   * }
   * ```
   */
  config?: string;

  /**
   * The path to the Tailwind CSS theme entry module.
   *
   * @remarks
   * By default this is resolved via `require.resolve('tailwindcss/theme')`.
   * Override this option when you want to load the theme layer from a custom
   * package or a dedicated `@theme` CSS file instead of the default Tailwind
   * theme.
   *
   * The value can be a module id that Node.js can resolve or an absolute file
   * path.
   *
   * @example
   *
   * Use a custom `@theme` CSS file:
   *
   * ```js
   * // rsbuild.config.ts
   * import path from 'node:path'
   * import { fileURLToPath } from 'node:url'
   * import { pluginTailwindCSS } from 'rsbuild-plugin-tailwindcss'
   *
   * const __dirname = path.dirname(fileURLToPath(import.meta.url))
   *
   * export default {
   *   plugins: [
   *     pluginTailwindCSS({
   *       theme: path.resolve(__dirname, './config/custom-theme.css'),
   *     }),
   *   ],
   * }
   * ```
   *
   * @example
   *
   * Use a shared theme package (ES module config):
   *
   * ```js
   * // rsbuild.config.ts
   * import { createRequire } from 'node:module'
   * import { pluginTailwindCSS } from 'rsbuild-plugin-tailwindcss'
   *
   * const require = createRequire(import.meta.url)
   *
   * export default {
   *   plugins: [
   *     pluginTailwindCSS({
   *       theme: require.resolve('@acme/tailwind-theme'),
   *     }),
   *   ],
   * }
   * ```
   */
  theme?: string;
}

export const pluginTailwindCSS = (
  options?: PluginTailwindCSSOptions,
): RsbuildPlugin => ({
  name: 'rsbuild:tailwindcss-v4',

  setup(api) {
    const require = createRequire(import.meta.url);
    const config = options?.config ?? 'tailwind.config.js';
    let theme = options?.theme ?? require.resolve('tailwindcss/theme');
    if (!path.isAbsolute(theme)) {
      theme = path.resolve(api.context.rootPath, theme);
    }
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
          tools: {
            postcss(_, { addPlugins }) {
              addPlugins(tailwindPostCSSPlugins({ theme }), { order: 'pre' });
            },
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
        .resource(
          new RegExp(
            VIRTUAL_UTILITIES_ID.replace(/\//g, '[\\\\/]').replace(
              /\./g,
              '\\.',
            ),
          ),
        )
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
