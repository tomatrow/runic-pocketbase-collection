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

## Available MCP Tools:

You are able to use the Svelte MCP server, where you have access to comprehensive Svelte 5 and SvelteKit documentation. Here's how to use the available tools effectively:

### 1. list-sections

Use this FIRST to discover all available documentation sections. Returns a structured list with titles, use_cases, and paths.
When asked about Svelte or SvelteKit topics, ALWAYS use this tool at the start of the chat to find relevant sections.

### 2. get-documentation

Retrieves full documentation content for specific sections. Accepts single or multiple sections.
After calling the list-sections tool, you MUST analyze the returned documentation sections (especially the use_cases field) and then use the get-documentation tool to fetch ALL documentation sections that are relevant for the user's task.

### 3. svelte-autofixer

Analyzes Svelte code and returns issues and suggestions.
You MUST use this tool whenever writing Svelte code before sending it to the user. Keep calling it until no issues or suggestions are returned.

### 4. playground-link

Generates a Svelte Playground link with the provided code.
After completing the code, ask the user if they want a playground link. Only call this tool after user confirmation and NEVER if code was written to files in their project.
