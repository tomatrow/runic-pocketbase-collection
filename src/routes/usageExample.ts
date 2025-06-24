import PocketBase, { type RecordModel } from "pocketbase"
import { Collection, pbid } from "$lib"

// minimal pocketbase setup
let pb = new PocketBase("http://127.0.0.1:8090")
pb.autoCancellation(false)
let tasks = new Collection<RecordModel & { text?: string; done?: boolean }>(pb.collection("tasks"))

// creates
let id = pbid()

// create
tasks.update({ [id]: { text: "New task" } })

// read
console.log(tasks.records[id]) // logs: "New task"

// update
tasks.update({ [id]: { done: true } })

// delete
tasks.update({ [id]: null })

// reactivity
let task = $derived(tasks.records[id])
$effect(() => {
	console.log(`${task.done ? "done" : "todo"} : ${task.text}`)
})
