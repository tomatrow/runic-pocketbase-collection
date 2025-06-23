#!/usr/bin/env fish

# grab latest simplecss and format
curl -L https://unpkg.com/simpledotcss/simple.css | string replace --all 'body ' '.simple-root ' > static/simple.css
pnpx prettier --write static/simple.css

# grab latest svelte llm context 
curl https://svelte-llm.khromov.se/svelte-distilled > scripts/svelte-distilled.txt

# check outdated
pnpm outdated
