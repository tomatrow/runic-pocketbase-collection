<script lang="ts">
	import PocketBase, { type RecordModel } from "pocketbase"
	import { Collection } from "$lib"
	import TaskAppExample from "./TaskAppExample.svelte"

	let { data } = $props()

	let pb = new PocketBase("http://127.0.0.1:8090")
	pb.autoCancellation(false)
	let tasks = new Collection<RecordModel & { text?: string; done?: boolean }>(
		pb.collection("tasks")
	)
</script>

<header>
	<h1>runic-pocketbase-collection</h1>
</header>

<main>
	<section>
		<h2>Installation</h2>
		<code>pnpm i -D runic-pocketbase-collection</code>
		<h2>Usage</h2>
	</section>

	<section>
		<h2>Task Example</h2>
		<TaskAppExample {tasks} />
		{@html data.exampleAppCode}
	</section>
</main>
