import PocketBase from "pocketbase"
import { Collection, pbid } from "$lib"

// explicit model type
interface TaskModel {
	id: string
	collectionId: string
	collectionName: string
	created: string
	updated: string
	text?: string
	done?: boolean
	subtasks: string[]
	expand: { subtasks: TaskModel[] }
}

// minimal pocketbase setup
let pb = new PocketBase("http://127.0.0.1:8090")
pb.autoCancellation(false)

// wrap task collection and expand subtasks
let tasks = new Collection<TaskModel>(pb.collection("tasks"), { expand: "subtasks" })

let parentTaskId = pbid()
let childTaskId = pbid()

// create a parent and child task
await tasks.update({
	[parentTaskId]: { text: "Parent task", subtasks: [childTaskId] },
	[childTaskId]: { text: "Child task" }
})

// read expanded task
console.log(
	tasks.records[parentTaskId].expand.subtasks.some((subtask) => subtask.id === childTaskId)
) // logs: true
