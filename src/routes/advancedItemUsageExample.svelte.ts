import PocketBase from "pocketbase"
import { Item } from "$lib/index.js"

// explicit model type
interface TaskModel {
	id: string
	collectionId: string
	collectionName: string
	created: string
	updated: string
	text?: string
	done?: boolean
	priority?: number
}

// minimal pocketbase setup
const pb = new PocketBase("http://127.0.0.1:8090")
pb.autoCancellation(false)

// wrap a single task with subscription options
const taskId = "abc123def456ghi" // existing task id
const task = new Item<TaskModel>(pb.collection("tasks"), taskId, {
	// real-time subscription options
	options: { expand: "subtasks" }
})

// refetch with options and error handling
await task.refetch({
	options: { expand: "subtasks" },
	onError: (error) => console.error("Failed to refetch:", error.message)
})

// optimistic update with override
await task.update(
	{ priority: 1 },
	{
		// immediately reflect change before server responds
		override: (prev) => ({ ...prev, priority: 1 }),
		onError: (error) => console.error("Failed to update:", error.message)
	}
)

// read updated record
console.log(task.record?.priority) // logs: 1
