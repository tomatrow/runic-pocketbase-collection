import { getAbortSignal } from "svelte"
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

// refetch on mount with cancellation
$effect(() => {
	task.refetch({
		options: { signal: getAbortSignal() },
		onError: error => console.error("Failed to refetch:", error.message)
	})
})

// optimistic update with override
await task.update(
	{ priority: 1 },
	{ onError: error => console.error("Failed to update:", error.message) }
)

// read updated record
console.log(task.record?.priority) // logs: 1

// update subscription options to truncate the text to 200 characters
task.updateSubscriptionOptions({ expand: "subtasks", fields: "*,text:excerpt(200,true)" })
