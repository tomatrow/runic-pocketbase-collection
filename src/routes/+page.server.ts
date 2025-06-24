import { codeToHtml } from "shiki"
import taskAppExampleCode from "./TaskAppExample.svelte?raw"
import type { PageServerLoad } from "./$types.js"

export const load: PageServerLoad = async () => {
	const exampleAppCode = await codeToHtml(
		taskAppExampleCode.replaceAll("\t", "  ").replace('"$lib"', '"runic-pocketbase-collection"'),
		{
			lang: "svelte",
			defaultColor: "light-dark()",
			themes: { light: "solarized-light", dark: "solarized-dark" }
		}
	)

	return { exampleAppCode }
}
