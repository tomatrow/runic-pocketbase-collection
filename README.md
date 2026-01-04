# Runic PocketBase Collection

Reactive PocketBase collection wrapper for Svelte 5 with real-time sync and optimistic updates.

## Features

- Rune-based reactivity
- Real-time sync via PocketBase subscriptions
- Optimistic updates via diff

## Installation

```bash
pnpm add runic-pocketbase-collection pocketbase
```

## Prerequisites

This library uses PocketBase's Batch API. Enable it in your PocketBase Admin UI:

**Settings** → **Application** → Enable **Batch requests**

## Quick Start

```ts
import PocketBase, { type RecordModel } from "pocketbase"
import { Collection, pbid } from "runic-pocketbase-collection"

const pb = new PocketBase("http://127.0.0.1:8090")
pb.autoCancellation(false)

const tasks = new Collection<RecordModel & { text?: string; done?: boolean }>(
	pb.collection("tasks")
)

// create
const id = pbid()
tasks.update({ [id]: { text: "New task" } })

// read
console.log(tasks.records[id]?.text)

// update
tasks.update({ [id]: { done: true } })

// delete
tasks.update({ [id]: null })

// reactivity
const task = $derived(tasks.records[id])
```

For single records, use `Item`:

```ts
import { Item } from "runic-pocketbase-collection"

const task = new Item(pb.collection("tasks"), "record_id")

// read
console.log(tasks.records[id]?.text)

// update
task.update({ done: true })

// reactivity
const taskIsDone = $derived(task.record?.done)
```

## License

MIT
