import satisfies from 'semver/functions/satisfies.js';
import pkg from 'tailwindcss/package.json' with { type: 'json' };

export function supportESM(): boolean {
  // Tailwind CSS support using ESM configuration in v3.3.0
  // See:
  //   - https://github.com/tailwindlabs/tailwindcss/releases/tag/v3.3.0
  //   - https://github.com/tailwindlabs/tailwindcss/pull/10785
  //   - https://github.com/rstackjs/rsbuild-plugin-tailwindcss/issues/18
  return satisfies(pkg.version, '^3.3.0');
}
