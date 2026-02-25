import fs from 'node:fs';
import { pathToFileURL } from 'node:url';
import QuickLRU from '@alloc/quick-lru';
import { compile } from '@tailwindcss/node';
import { clearRequireCache } from '@tailwindcss/node/require-cache';

export interface CompilerOptions {
  config: string | null;
  theme: string;
  utilities: string;
  base: string;
}

interface CacheEntry {
  mtimes: Map<string, number>;
  compiler: Awaited<ReturnType<typeof compile>>;
  fullRebuildPaths: string[];
}

const cache = /*#__PURE__*/ new QuickLRU<string, CacheEntry>({ maxSize: 50 });

function getCacheKey({ base, config, theme }: CompilerOptions): string {
  return [base, config ?? '', theme].join('|');
}

function getContextFromCache(options: CompilerOptions): CacheEntry | undefined {
  const key = getCacheKey(options);

  return cache.get(key);
}

function pathToImportString(pathStr: string): string {
  return JSON.stringify(pathToFileURL(pathStr).toString());
}

async function createCompiler(options: CompilerOptions): Promise<CacheEntry> {
  const { config, theme, utilities, base } = options;

  const cssInput = `
${config ? `@config ${pathToImportString(config)};` : '/** no config */'}
@import ${pathToImportString(theme)} layer(theme);
@import ${pathToImportString(utilities)} layer(utilities);
`;

  const fullRebuildPaths: string[] = [];

  const context: CacheEntry = {
    mtimes: new Map(),
    compiler: await compile(cssInput, {
      base,
      onDependency: (dep) => fullRebuildPaths.push(dep),
    }),
    fullRebuildPaths,
  };

  if (config) {
    fullRebuildPaths.push(config);
  }

  for (const dep of fullRebuildPaths) {
    try {
      context.mtimes.set(dep, fs.statSync(dep).mtimeMs);
    } catch {
      // ignore
    }
  }

  cache.set(getCacheKey(options), context);

  return context;
}

export async function getCompiler(
  options: CompilerOptions,
): Promise<CacheEntry> {
  const context = getContextFromCache(options);

  if (!context) {
    return await createCompiler(options);
  }

  // Check mtimes of all dependencies to determine if we need to rebuild the compiler.
  let needsRebuild = false;
  for (const dep of context.fullRebuildPaths) {
    try {
      const mtime = fs.statSync(dep).mtimeMs;
      if (context.mtimes.get(dep) !== mtime) {
        needsRebuild = true;
        break;
      }
    } catch {
      // If the file is missing or inaccessible, we should rebuild.
      needsRebuild = true;
      break;
    }
  }

  if (needsRebuild) {
    clearRequireCache(context.fullRebuildPaths);
    cache.delete(getCacheKey(options));
    return await createCompiler(options);
  }

  return context;
}

export function cleanupCache(options: CompilerOptions): void {
  cache.delete(getCacheKey(options));
}
