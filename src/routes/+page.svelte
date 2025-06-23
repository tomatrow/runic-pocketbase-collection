<script lang="ts">
	import PocketBase, { type RecordModel } from "pocketbase"
	import { Collection } from "$lib/Collection.svelte"

	/** pocketbase only supports 15 character alphanumeric ids */
	function pbid() {
		return [...crypto.randomUUID()]
			.filter((char) => char !== "-")
			.slice(0, 15)
			.join("")
	}

	const pb = new PocketBase("http://127.0.0.1:8090")
	pb.autoCancellation(false)
	const todos = new Collection<RecordModel & { text?: string; done?: boolean }>(
		pb.collection("todos")
	)
	const list = $derived(Object.values(todos.records))

	$inspect(list)
</script>

<header>
	<h1>runic-pocketbase-collection</h1>
</header>

<main>
	<table>
		<thead>
			<tr>
				<th>
					<input
						type="checkbox"
						indeterminate={true}
						checked={list.every((todo) => todo.done)}
						onclick={() => {
							if (list.every((todo) => todo.done)) {
								todos.update(Object.fromEntries(list.map((todo) => [todo.id, { done: false }])))
							} else {
								todos.update(Object.fromEntries(list.map((todo) => [todo.id, { done: true }])))
							}
						}}
					/>
				</th>
				<th></th>
				<th>
					<button
						onclick={() => todos.update(Object.fromEntries(list.map((todo) => [todo.id, null])))}
						>X</button
					>
				</th>
			</tr>
		</thead>
		<tbody>
			{#each list as todo (todo.id)}
				<tr>
					<td>
						<input
							type="checkbox"
							checked={todo.done}
							onclick={() => todos.update({ [todo.id]: { done: !todo.done } })}
						/>
					</td>
					<td>
						<input
							value={todo.text}
							oninput={(event) => todos.update({ [todo.id]: { text: event.currentTarget.value } })}
						/>
					</td>
					<td><button onclick={() => todos.update({ [todo.id]: null })}>X</button></td>
				</tr>
			{/each}
		</tbody>

		<tfoot>
			<tr>
				<th></th>
				<td>
					<input
						placeholder="add new item"
						onkeydown={(event) => {
							if (event.key !== "Enter") return
							todos.update({ [pbid()]: { text: event.currentTarget.value } })
							event.currentTarget.value = ""
						}}
					/>
				</td>
				<th></th>
			</tr>
		</tfoot>
	</table>
</main>
