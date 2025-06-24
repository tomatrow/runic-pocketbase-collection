<script lang="ts">
	import { type RecordModel } from "pocketbase"
	import { Collection, pbid } from "$lib"

	let { tasks }: { tasks: Collection<RecordModel & { text?: string; done?: boolean }> } = $props()

	let taskList = $derived(Object.values(tasks.records))
	let newTaskText = $state("")
</script>

<table>
	<thead>
		<tr>
			<th>
				<input
					type="checkbox"
					indeterminate={taskList.some((task) => task.done) && taskList.some((task) => !task.done)}
					checked={taskList.length && taskList.every((task) => task.done)}
					onclick={() =>
						tasks.update(
							Object.fromEntries(
								taskList.map((task) => [task.id, { done: !taskList.every((task) => task.done) }])
							)
						)}
				/>
			</th>
			<th>
				{taskList.filter((task) => task.done).length}/{taskList.length} done
			</th>
			<th>
				<button
					onclick={() => tasks.update(Object.fromEntries(taskList.map((task) => [task.id, null])))}
				>
					❌
				</button>
			</th>
		</tr>
	</thead>
	<tbody>
		{#each taskList as task (task.id)}
			<tr>
				<td>
					<input
						type="checkbox"
						checked={task.done}
						onclick={() => tasks.update({ [task.id]: { done: !task.done } })}
					/>
				</td>
				<td>
					<input
						type="text"
						value={task.text}
						oninput={(event) => tasks.update({ [task.id]: { text: event.currentTarget.value } })}
					/>
				</td>
				<td><button onclick={() => tasks.update({ [task.id]: null })}>❌</button></td>
			</tr>
		{/each}
	</tbody>

	<tfoot>
		<tr>
			<td></td>
			<td>
				<input type="text" bind:value={newTaskText} placeholder="New task" />
			</td>
			<td>
				<button
					disabled={!newTaskText}
					onclick={() => {
						tasks.update({ [pbid()]: { text: newTaskText } })
						newTaskText = ""
					}}
				>
					✚
				</button>
			</td>
		</tr>
	</tfoot>
</table>

<style>
	table,
	input[type="text"] {
		width: 100%;
	}
</style>
