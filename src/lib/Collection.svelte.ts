import type {
	ClientResponseError,
	RecordFullListOptions,
	RecordModel,
	RecordService,
	RecordSubscribeOptions,
	SendOptions
} from "pocketbase"
import { RunicRecordService } from "./RunicRecordService.svelte.js"
import type { UpdateOverride, RecordUpdate } from "./common.js"

export class Collection<M extends RecordModel = RecordModel> {
	#wrapper: RunicRecordService<M>

	constructor(recordService: RecordService<M>, options?: RecordSubscribeOptions) {
		this.#wrapper = new RunicRecordService(recordService, "*", options)
	}

	async reload({
		options,
		onError = console.error
	}: {
		options?: RecordFullListOptions
		onError?(error: ClientResponseError): void
	} = {}) {
		try {
			const fullList = await this.#wrapper.service.getFullList(options)
			this.#wrapper.records = Object.fromEntries(fullList.map((record) => [record.id, record]))
		} catch (error) {
			onError(error as ClientResponseError)
		}
	}

	async update(
		recordsUpdate: Record<string, RecordUpdate<M> | null>,
		{
			options,
			override,
			onError = console.error
		}: {
			options?: SendOptions
			override?: UpdateOverride<Record<string, M>>
			onError?(error: ClientResponseError): void
		} = {}
	) {
		await this.#wrapper.update(recordsUpdate, { options, override, onError })
	}

	get records() {
		return this.#wrapper.getRecords()
	}
}
