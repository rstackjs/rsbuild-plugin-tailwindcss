# AGENTS.md

This file provides context and strict guidelines for autonomous coding agents (like Cursor, Copilot, or OpenCode) operating within this repository (`rsbuild-plugin-tailwindcss`). 

*(Note: No other `.cursorrules` or Copilot instruction files exist in this repository. This file serves as the single source of truth for agent behavior.)*

---

## 🛠 Tech Stack Overview
- **Package Manager**: `pnpm` (strictly use this; do not use npm or yarn).
- **Core Frameworks**: Rsbuild plugin integrating Tailwind CSS v4, PostCSS, and Rslib.
- **Language**: TypeScript (ES2023 target, ESM format).
- **Linter & Formatter**: Biome.
- **Testing**: Playwright (`@playwright/test`).

---

## 🚀 Build, Lint, and Test Commands

### Setup
Ensure you run `pnpm install` first to install dependencies before executing any tasks.

### Build & Dev
- **Build the plugin**: `pnpm build` (runs Rslib to build the project into the `dist/` folder).
- **Watch/Dev mode**: `pnpm dev` (rebuilds the plugin automatically on changes).

### Linting and Formatting
- **Check code**: `pnpm lint` (runs `biome check .`).
- **Fix and format code**: `pnpm lint:write` (runs `biome check . --write`).
- *Note:* Always run `pnpm lint:write` before concluding a task to ensure code styling matches the repo's Biome configuration.

### Testing
- **Run all tests**: `pnpm test` (uses Playwright with `--workers 1`).
- **Run a single test file**: 
  ```bash
  pnpm test test/basic/index.test.ts
  ```
- **Run a specific test case within a file**: 
  ```bash
  pnpm test test/basic/index.test.ts -g "preflight base styles are applied"
  ```
- *Note:* Tests involve spinning up a temporary Rsbuild server and checking computed styles via a headless browser.

---

## 🧑‍💻 Code Style & Conventions

### 1. Imports and Modules
- **ES Modules (ESM)**: The codebase strictly uses ESM. Use `import`/`export` syntax.
- **Local Imports**: Always append the `.js` extension for local relative imports (e.g., `import { compile } from './compiler.js';`).
- **Node Built-ins**: Use the `node:` prefix for all Node.js core modules (e.g., `import fs from 'node:fs';`, `import path from 'node:path';`).
- **Type Imports**: Use `import type { ... }` exclusively for importing TypeScript interfaces and types to avoid runtime overhead.
- **Biome Formatting**: Biome is configured to automatically organize imports. Let `pnpm lint:write` handle import sorting rather than doing it manually.

### 2. Formatting (Biome)
- Use **spaces** for indentation.
- Use **single quotes** for strings (in JavaScript/TypeScript).
- Do not spend time manually aligning or perfectly formatting code; rely on `pnpm lint:write` to format the code automatically after making changes.

### 3. TypeScript & Types
- Strict mode is enabled (`"strict": true`).
- **Interfaces vs Types**: Prefer `interface` over `type` for defining options, configurations, and object structures.
- **JSDoc**: Document public APIs, exported interfaces, and complex options using standard JSDoc comments (`/** ... */`). See `src/index.ts` for examples.
- **Type Safety**: Avoid `any`. Use `unknown` or specific generics if type information is complex or unknown at compile time.

### 4. Naming Conventions
- Variables, functions, and properties: `camelCase`.
- Interfaces, Types, and Classes: `PascalCase`.
- Internal/Virtual file names and global constants: `UPPER_SNAKE_CASE` (e.g., `VIRTUAL_UTILITIES_ID`).
- Boolean variables or methods: Prefix with `is`, `has`, or `should`.

### 5. Error Handling & Logic
- Throw clear, descriptive errors when configurations are missing or invalid, ensuring the user understands what went wrong.
- For asynchronous file system operations, utilize async/await with `try/catch` where the error might bubble up or where specific recovery/fallback behavior is required.
- If a build step fails inside the plugin, let Rsbuild/Rspack handle the error gracefully; provide relevant context if possible.

---

## 🧪 Testing Structure & Methodology

- **Location**: Tests are located in the `test/` directory, broken down by feature or scenario folders (e.g., `test/theme/`, `test/basic/`).
- **Framework**: `Playwright` is used as the primary test runner for integration and E2E testing.
- **Standard Test Flow**:
  1. Initialize Rsbuild with the target directory and the Tailwind plugin:
     ```typescript
     const rsbuild = await createRsbuild({
       cwd: __dirname,
       rsbuildConfig: { plugins: [pluginTailwindCSS()] }
     });
     ```
  2. Build the app: `await rsbuild.build();`
  3. Preview it: `const { server, urls } = await rsbuild.preview();`
  4. Navigate to the URL: `await page.goto(urls[0]);`
  5. Assert against computed styles rather than raw CSS strings:
     ```typescript
     await expect(page.locator('#test')).toHaveCSS('display', 'flex');
     ```
  6. Clean up: Always close the server in the test execution (e.g., `await server.close();`).

---

## 🤖 General Agent Instructions

1. **Do not break existing workflows**: Run tests (`pnpm test`) and linting (`pnpm lint`) locally to verify your changes before concluding your task or committing.
2. **Minimize file modifications**: Only change files that are strictly required to fulfill the user's objective. Do not preemptively rewrite or refactor unrelated parts of the codebase.
3. **Respect established patterns**: Look at existing files like `src/index.ts` and `src/compiler.ts` to mimic the codebase's tone, architecture, and complexity.
4. **Use appropriate tools**: Utilize `read`, `glob`, and `grep` to build context before making code modifications. When creating or editing files, always ensure you provide absolute paths.
5. **No implicit assumptions**: Verify dependencies and module existence before importing them. If adding a new feature, follow the test-driven approach evident in the `test/` directory.
