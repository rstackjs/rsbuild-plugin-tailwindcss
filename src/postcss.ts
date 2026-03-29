import tailwindcss from '@tailwindcss/postcss';
import type { AcceptedPlugin, Plugin, PluginCreator } from 'postcss';

export interface TailwindCSSPostCSSOptions {
  theme: string;
}

const injectTailwindThemePlugin: PluginCreator<TailwindCSSPostCSSOptions> = (
  options?: TailwindCSSPostCSSOptions,
): Plugin => {
  const themePath = options?.theme.replace(/\\/g, '/');

  return {
    postcssPlugin: 'rsbuild-inject-tailwind-theme',

    Once(root, { AtRule }) {
      if (!themePath) {
        return;
      }
      root.prepend(
        new AtRule({
          name: 'reference',
          params: JSON.stringify(themePath),
        }),
      );
    },
  };
};

injectTailwindThemePlugin.postcss = true;

export function tailwindPostCSSPlugins(
  options: TailwindCSSPostCSSOptions,
): AcceptedPlugin[] {
  return [injectTailwindThemePlugin(options), tailwindcss()];
}
