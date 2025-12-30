import { codeToHtml } from "shiki"
import rawTaskAppExampleCode from "./TaskAppExample.svelte?raw"
import rawCollectionUsageExampleCode from "./collectionUsageExample.svelte.js?raw"
import rawAdvancedCollectionUsageExampleCode from "./advancedCollectionUsageExample.svelte.js?raw"
import rawItemUsageExampleCode from "./itemUsageExample.svelte.js?raw"
import rawAdvancedItemUsageExampleCode from "./advancedItemUsageExample.svelte.js?raw"
import type { PageServerLoad } from "./$types.js"

export const prerender = true

export const load: PageServerLoad = async () => {
	const collectionUsageExampleCode = await codeToHtml(
		rawCollectionUsageExampleCode
			.replaceAll("\t", "  ")
			.replace('"$lib/index.js"', '"runic-pocketbase-collection"'),
		{
			lang: "typescript",
			defaultColor: "light-dark()",
			themes: { light: "solarized-light", dark: "solarized-dark" }
		}
	)

	const advancedCollectionUsageExampleCode = await codeToHtml(
		rawAdvancedCollectionUsageExampleCode
			.replaceAll("\t", "  ")
			.replace('"$lib/index.js"', '"runic-pocketbase-collection"'),
		{
			lang: "typescript",
			defaultColor: "light-dark()",
			themes: { light: "solarized-light", dark: "solarized-dark" }
		}
	)

	const taskAppExampleCode = await codeToHtml(
		rawTaskAppExampleCode
			.replaceAll("\t", "  ")
			.replace('"$lib/index.js"', '"runic-pocketbase-collection"'),
		{
			lang: "svelte",
			defaultColor: "light-dark()",
			themes: { light: "solarized-light", dark: "solarized-dark" }
		}
	)

	const itemUsageExampleCode = await codeToHtml(
		rawItemUsageExampleCode
			.replaceAll("\t", "  ")
			.replace('"$lib/index.js"', '"runic-pocketbase-collection"'),
		{
			lang: "typescript",
			defaultColor: "light-dark()",
			themes: { light: "solarized-light", dark: "solarized-dark" }
		}
	)

	const advancedItemUsageExampleCode = await codeToHtml(
		rawAdvancedItemUsageExampleCode
			.replaceAll("\t", "  ")
			.replace('"$lib/index.js"', '"runic-pocketbase-collection"'),
		{
			lang: "typescript",
			defaultColor: "light-dark()",
			themes: { light: "solarized-light", dark: "solarized-dark" }
		}
	)

	return {
		collectionUsageExampleCode,
		taskAppExampleCode,
		advancedCollectionUsageExampleCode,
		itemUsageExampleCode,
		advancedItemUsageExampleCode
	}
}
