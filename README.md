# Runic PocketBase Collection

A reactive PocketBase collection manager for Svelte 5 using runes. Provides real-time synchronization, optimistic updates, and seamless state management.

## Features

- 🔮 **Svelte 5 Runes** - Built with modern Svelte 5 reactive primitives
- ⚡ **Real-time Sync** - Automatic subscription to PocketBase real-time events
- 🎯 **Optimistic Updates** - Instant UI updates with automatic rollback on errors
- 📦 **Type Safe** - Full TypeScript support with generic types
- 🚀 **Zero Config** - Works out of the box with any PocketBase collection

## Installation

```sh
pnpm i -D runic-pocketbase-collection
```

## Quick Start

```svelte
<script>
	import PocketBase from "pocketbase"
	import { Collection } from "runic-pocketbase-collection"

	const pb = new PocketBase("http://127.0.0.1:8090")
	const todos = new Collection(pb.collection("todos"))

	// Reactive access to all records
	$: allTodos = todos.records
</script>

{#each Object.values(allTodos) as todo}
	<div>
		<input
			type="checkbox"
			checked={todo.completed}
			onchange={() => todos.update({ [todo.id]: { completed: !todo.completed } })}
		/>
		{todo.title}
	</div>
{/each}
```

## API Reference

### Constructor

```typescript
new Collection<T>(recordService: RecordService<T>, options?: RecordSubscribeOptions)
```

### Properties

#### `records`

Reactive object containing all collection records, keyed by ID. Automatically updates when data changes.

```svelte
<script>
	const collection = new Collection(pb.collection("posts"))

	// Reactive - will update when records change
	$: posts = collection.records
</script>
```

### Methods

#### `load(options?)`

Manually load records from the server.

```typescript
await collection.load({
	filter: 'status = "published"',
	sort: "-created"
})
```

#### `update(recordsUpdate, options?)`

Batch update multiple records with optimistic updates.

```typescript
// Update single record
await collection.update({
	"record-id": { title: "New Title" }
})

// Update multiple records
await collection.update({
	id1: { status: "published" },
	id2: { status: "draft" },
	id3: null // Delete record
})

// With per-record options
await collection.update({ id1: { title: "New Title" } }, (id) => ({ expand: "author" }))
```

## Advanced Usage

### Filtering and Sorting

```svelte
<script>
	import { Collection } from "runic-pocketbase-collection"

	const posts = new Collection(pb.collection("posts"))

	// Load with filters
	$effect(() => {
		posts.load({
			filter: 'status = "published"',
			sort: "-created",
			expand: "author"
		})
	})
</script>
```

### Optimistic Updates

Updates are applied immediately to the UI, then synchronized with the server:

```svelte
<script>
	async function toggleTodo(todo) {
		try {
			// UI updates immediately
			await todos.update({
				[todo.id]: { completed: !todo.completed }
			})
		} catch (error) {
			// Automatically rolled back on error
			console.error("Failed to update todo:", error)
		}
	}
</script>
```

### Real-time Subscriptions

Collections automatically subscribe to real-time updates:

```svelte
<script>
	// Automatically receives real-time updates from other clients
	const messages = new Collection(pb.collection("messages"), {
		// Optional: customize subscription
		expand: "user"
	})
</script>
```

### TypeScript Support

```typescript
interface Todo {
	id: string
	title: string
	completed: boolean
	created: string
	updated: string
}

const todos = new Collection<Todo>(pb.collection("todos"))

// Fully typed
const todoList: Record<string, Todo> = todos.records
```

### Error Handling

```svelte
<script>
	async function updateMultiple() {
		try {
			await collection.update({
				id1: { title: "Updated 1" },
				id2: { title: "Updated 2" },
				id3: { title: "Updated 3" }
			})
		} catch (error) {
			if (error instanceof AggregateError) {
				console.log(`${error.errors.length} updates failed`)
				error.errors.forEach((err) => console.error(err))
			}
		}
	}
</script>
```

## Requirements

- Svelte 5.0+
- PocketBase client

## License

MIT
