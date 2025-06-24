<script lang="ts">
	import PocketBase, { type RecordModel } from "pocketbase"
	import { Collection } from "$lib"
	import TaskAppExample from "./TaskAppExample.svelte"
	import { dev } from "$app/environment"

	let { data } = $props()

	let pb = new PocketBase("http://127.0.0.1:8090")
	pb.autoCancellation(false)
	let tasks = new Collection<RecordModel & { text?: string; done?: boolean }>(
		pb.collection("tasks")
	)
</script>

<header>
	<h1>runic-pocketbase-collection</h1>

	<nav>
		<ul>
			<li><a href="/">home</a></li>
			<li>
				<a target="blank" href="https://tomatrow.github.com/runic-pocketbase-collection">
					github repo
				</a>
			</li>
			<li><a target="blank" href="https://ajcaldwell.dev">aj caldwell</a></li>
		</ul>
	</nav>
</header>

<main>
	<section>
		<p>A pocketbase collection wrapper for Svelte</p>

		<ul>
			<li>rune based reactivity</li>
			<li>real time sync</li>
			<li>optimistic updates via diff</li>
		</ul>
	</section>

	<section>
		<h2>Installation</h2>
		<code>pnpm i -D runic-pocketbase-collection</code>
	</section>

	<section>
		<h2>Usage</h2>
		{@html data.usageExampleCode}
	</section>

	<section>
		<h2>Task App Example</h2>

		{#if dev}
			<TaskAppExample {tasks} />
		{:else}
			<img class="only-on-light" alt="example task app" src="images/example-task-app-light.png" />
			<img class="only-on-dark" alt="example task app" src="images/example-task-app-dark.png" />
		{/if}

		{@html data.taskAppExampleCode}
	</section>
</main>

<style>
	@media (prefers-color-scheme: dark) {
		.only-on-light {
			display: none;
		}
	}

	@media (prefers-color-scheme: light) {
		.only-on-dark {
			display: none;
		}
	}
</style>
