import PocketBase, { type RecordModel } from "pocketbase"
import { Collection, pbid } from "$lib/index.js"

// minimal pocketbase setup
const pb = new PocketBase("http://127.0.0.1:8090")
pb.autoCancellation(false)
const tasks = new Collection<RecordModel & { text?: string; done?: boolean }>(
	pb.collection("tasks")
)

// creates 15 character alphanumeric id
const id = pbid()

// create
tasks.update({ [id]: { text: "New task" } })

// read
console.log(tasks.records[id]?.text) // logs: "New task"

// update
tasks.update({ [id]: { done: true } })

// delete
tasks.update({ [id]: null })

// reactivity
const task = $derived(tasks.records[id])
$effect(() => {
	console.log(`${task?.done ? "done" : "todo"} : ${task?.text}`)
})
