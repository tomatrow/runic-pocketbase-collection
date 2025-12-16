# AGENTS.md

## Commands

- `pnpm dev` - Start development server
- `pnpm build` - Build library (vite + svelte-package)
- `pnpm lint` - Run Prettier + ESLint checks
- `pnpm check` - TypeScript/Svelte type checking
- `pnpm format` - Auto-format with Prettier

## Code Style

- **Formatting:** Tabs, no semicolons, double quotes, no trailing commas, 100 char width
- **TypeScript:** Strict mode enabled, proper type annotations required
- **Svelte 5:** Use runes (`$state`, `$derived`, `$effect`, `$props`) - they're globals, no imports
- **State:** `$state()` always with `let`, `$derived.by()` for functions, `$state.raw()` for non-reactive objects
- **Naming:** Event handlers prefixed with "handle" (e.g., `handleClick`)
- **Files:** Use `$lib` for shared code, `.svelte.ts` for reactive utilities
- **Errors:** try-catch in event handlers/async functions; error boundaries only catch render/$effect errors
- **Imports:** Group by external deps first, then internal (`$lib`)
