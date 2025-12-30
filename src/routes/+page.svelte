<script lang="ts">
	import PocketBase, { type RecordModel } from "pocketbase"
	import { Collection } from "$lib/index.js"
	import TaskAppExample from "./TaskAppExample.svelte"
	import { dev } from "$app/environment"
	import { resolve } from "$app/paths"

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
			<li><a href={resolve("/")}>home</a></li>
			<li>
				<a target="blank" href="https://github.com/tomatrow/runic-pocketbase-collection">
					github repo
				</a>
			</li>
			<li><a target="blank" href="https://ajcaldwell.dev">aj caldwell</a></li>
		</ul>
	</nav>
</header>

<main>
	<section id="intro">
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

	<section id="collection-usage">
		<h2>Collection Usage</h2>

		<!-- eslint-disable-next-line svelte/no-at-html-tags -->
		{@html data.collectionUsageExampleCode}
	</section>

	<section id="task-example-app">
		<h2>Task App Example</h2>

		{#if dev}
			<TaskAppExample {tasks} />
		{:else}
			<img class="only-on-light" alt="example task app" src="images/example-task-app-light.png" />
			<img class="only-on-dark" alt="example task app" src="images/example-task-app-dark.png" />
		{/if}

		<!-- eslint-disable-next-line svelte/no-at-html-tags -->
		{@html data.taskAppExampleCode}
	</section>

	<section id="advanced-collection-usage">
		<h2>Advanced Collection Usage</h2>

		<!-- eslint-disable-next-line svelte/no-at-html-tags -->
		{@html data.advancedCollectionUsageExampleCode}
	</section>

	<section id="item-usage">
		<h2>Item Usage</h2>

		<!-- eslint-disable-next-line svelte/no-at-html-tags -->
		{@html data.itemUsageExampleCode}
	</section>

	<section id="advanced-item-usage">
		<h2>Advanced Item Usage</h2>

		<!-- eslint-disable-next-line svelte/no-at-html-tags -->
		{@html data.advancedItemUsageExampleCode}
	</section>

	<section id="development">
		<h2>Development</h2>
		<p>
			You'll need to add a <a target="_blank" href="https://pocketbase.io/docs/"
				>pocketbase executable</a
			> to the database directory.
		</p>
		<p>
			The following start script assumes you have <a target="_blank" href="https://pnpm.io">pnpm</a>
			/ <a target="_blank" href="https://github.com/tmux/tmux/wiki">tmux</a> /
			<a target="_blank" href="https://fishshell.com">fish</a>
			installed.
		</p>
		<pre>
<code>pnpm i</code>
<code>pnpm run start</code>
<code># pocketbase now running at http://127.0.0.1:8090/_</code>
<code># sveltekit app now running at http://localhost:5173</code></pre>
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
