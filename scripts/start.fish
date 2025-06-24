#!/usr/bin/env fish

source scripts/config.fish

tmux_triple_pane --preamble='source scripts/config.fish; srcenv .env.local;' --left 'pnpm run database' --right 'pnpm run dev' --center 'pnpm outdated'
