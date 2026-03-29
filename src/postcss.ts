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

      const file = root.source?.input.file || '';

      // Use @reference for CSS modules to avoid duplicating theme variables in every module.
      // Use @import for global CSS and regular CSS files to ensure theme variables are emitted.
      const isCssModule = /\.module\.(css|scss|sass|less|styl)$/i.test(file);

      root.prepend(
        new AtRule({
          name: isCssModule ? 'reference' : 'import',
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
