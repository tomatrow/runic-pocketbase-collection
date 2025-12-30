import { codeToHtml } from "shiki"
import rawTaskAppExampleCode from "./TaskAppExample.svelte?raw"
import rawUsageExampleCode from "./usageExample.svelte.js?raw"
import rawAdvancedUsageExampleCode from "./advancedUsageExample.svelte.js?raw"
import type { PageServerLoad } from "./$types.js"

export const prerender = true

export const load: PageServerLoad = async () => {
	const usageExampleCode = await codeToHtml(
		rawUsageExampleCode
			.replaceAll("\t", "  ")
			.replace('"$lib/index.js"', '"runic-pocketbase-collection"'),
		{
			lang: "typescript",
			defaultColor: "light-dark()",
			themes: { light: "solarized-light", dark: "solarized-dark" }
		}
	)

	const advancedUsageExampleCode = await codeToHtml(
		rawAdvancedUsageExampleCode
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

	return { usageExampleCode, taskAppExampleCode, advancedUsageExampleCode }
}
