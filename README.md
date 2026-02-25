# rsbuild-plugin-tailwindcss

An Rsbuild plugin to integrate with [Tailwind CSS](https://tailwindcss.com/) V4.

<p>
  <a href="https://npmjs.com/package/rsbuild-plugin-tailwindcss">
   <img src="https://img.shields.io/npm/v/rsbuild-plugin-tailwindcss/v4?style=flat-square&colorA=564341&colorB=EDED91" alt="npm version" />
  </a>
  <img src="https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square&colorA=564341&colorB=EDED91" alt="license" />
  <a href="https://npmcharts.com/compare/rsbuild-plugin-tailwindcss?minimal=true"><img src="https://img.shields.io/npm/dm/rsbuild-plugin-tailwindcss.svg?style=flat-square&colorA=564341&colorB=EDED91" alt="downloads" /></a>
</p>

## Why?

Tailwind CSS v4 is able to remove unused CSS classes through the `@tailwindcss/webpack` plugin. It scans utilities based on `@source` directives (and falls back to `**/*` when none are defined), which can still be inaccurate or redundant when:

- Using multiple entries
- Using a Tailwind CSS-based component library

This plugin automatically wires `@tailwindcss/webpack` into Rspack and injects a virtual Tailwind utilities import for each JS/TS module, so Tailwind effectively gets a precise `@source` per module and generates CSS _**based on usage**_ across all entries and shared components.

## Usage

Install:

```bash
npm add tailwindcss rsbuild-plugin-tailwindcss@v4 -D
```

Add plugin to your `rsbuild.config.ts`:

```ts
// rsbuild.config.ts
import { pluginTailwindCSS } from "rsbuild-plugin-tailwindcss";

export default {
  plugins: [pluginTailwindCSS()],
};
```

### Custom Tailwind CSS Configuration

Create a `tailwind.config.js` file at the root of the project:

```js
/** @type {import('tailwindcss').Config} */
export default {
  theme: {
    colors: {
      blue: "#1fb6ff",
      purple: "#7e5bef",
      pink: "#ff49db",
      orange: "#ff7849",
      green: "#13ce66",
      yellow: "#ffc82c",
      "gray-dark": "#273444",
      gray: "#8492a6",
      "gray-light": "#d3dce6",
    },
  },
};
```

This will be auto-loaded by Rsbuild and applied by `rsbuild-plugin-tailwindcss`.

### Custom theme with `@theme`

Tailwind CSS v4 also lets you define design tokens using the `@theme` directive in a CSS file.

Create a theme file, for example `src/theme.css`:

```css
@import "tailwindcss/theme" layer(theme);

@theme {
  /* extend default theme variables */
  --color-brand-primary: #010203;
}
```

Then point the plugin to this file so it is imported before utilities:

```ts
// rsbuild.config.ts
import { pluginTailwindCSS } from "rsbuild-plugin-tailwindcss";

export default {
  plugins: [
    pluginTailwindCSS({
      theme: "./src/theme.css",
    }),
  ],
};
```

Now you can use utilities generated from your custom theme variables, for example:

```html
<div class="text-brand-primary">Hello</div>
```

## Options

### `config`

- Type: `string | undefined`
- Default: `tailwind.config.js`

The path to custom Tailwind CSS configuration. Could be a relative path from the root of the project or an absolute path.

- Example:

```js
// rsbuild.config.ts
import { pluginTailwindCSS } from "rsbuild-plugin-tailwindcss";

export default {
  plugins: [
    pluginTailwindCSS({
      config: "./config/tailwind.config.js",
    }),
  ],
};
```

### `theme`

- Type: `string | undefined`
- Default: resolved path to `tailwindcss/theme`

The path to a CSS file that defines Tailwind theme variables using the `@theme` directive. This file is imported before Tailwind utilities so that any custom variables can generate additional utilities.

- Example:

```ts
// rsbuild.config.ts
import { pluginTailwindCSS } from "rsbuild-plugin-tailwindcss";

export default {
  plugins: [
    pluginTailwindCSS({
      theme: "./src/theme.css",
    }),
  ],
};
```

```css
/** src/theme.css */
@import "tailwindcss/theme" layer(theme);

@theme {
  --color-brand-theme: #010204;
}
```

## Credits

Thanks to:

- [Tailwind CSS V4](https://tailwindcss.com/blog/tailwindcss-v4-alpha) for the idea of purge CSS by module graph.

## License

[MIT](./LICENSE).
