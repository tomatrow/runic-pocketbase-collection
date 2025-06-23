#!/usr/bin/env fish

source scripts/config.fish

srcenv .env.local

uv run \
  --python python3.12 \
  --with aider-chat \
  --with watchfiles \
  --with google-cloud-aiplatform \
  '/Users/ajcaldwell/Library/Application Support/Nova/Extensions/dev.ajcaldwell.aider/nova-aider.py' \
  --config .aider.conf.yaml
