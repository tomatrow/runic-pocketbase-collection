import PocketBase, { type RecordModel } from "pocketbase"
import { Item } from "$lib/index.js"

// minimal pocketbase setup
const pb = new PocketBase("http://127.0.0.1:8090")
pb.autoCancellation(false)

// wrap a single task by id
const taskId = "abc123def456ghi" // existing task id
const task = new Item<RecordModel & { text?: string; done?: boolean }>(
	pb.collection("tasks"),
	taskId
)

// read
console.log(task.record?.text) // logs: "Existing task"

// update
task.update({ done: true })

// reactivity
const taskText = $derived(task.record?.text)
$effect(() => {
	console.log(`Task: ${taskText}`)
})
