import type {
	ClientResponseError,
	RecordModel,
	RecordService,
	RecordSubscribeOptions,
	SendOptions
} from "pocketbase"
import type { UpdateOverride, RecordUpdate } from "./common.js"
import { RunicRecordService } from "./RunicRecordService.svelte.js"

export class Item<M extends RecordModel = RecordModel> {
	#wrapper: RunicRecordService<M>
	#id: string

	constructor(
		recordService: RecordService<M>,
		id: string,
		{
			options,
			autoRefetch,
			onError = console.error
		}: {
			autoRefetch?: boolean
			options?: RecordSubscribeOptions
			onError?(error: ClientResponseError): void
		} = {}
	) {
		this.#wrapper = new RunicRecordService(recordService, id, {
			options,
			onError,
			autoRefetch,
			fetchRecords: async (options) => {
				return [await recordService.getOne(id, options)]
			}
		})
		this.#id = id
	}

	async refetch({
		options,
		onError = console.error
	}: {
		options?: SendOptions
		onError?(error: ClientResponseError): void
	} = {}) {
		await this.#wrapper.refetch({ options, onError })
	}

	async update(
		recordUpdate: RecordUpdate<M>,
		{
			options,
			override,
			onError = console.error
		}: {
			options?: SendOptions
			override?: UpdateOverride<M>
			onError?(error: ClientResponseError): void
		} = {}
	) {
		await this.#wrapper.update(
			{ [this.#id]: recordUpdate },
			{
				onError,
				options,
				override:
					override &&
					((records) => {
						const prevRecord = records[this.#id]
						if (!prevRecord) return records
						return { ...records, [this.#id]: override(prevRecord) }
					})
			}
		)
	}

	get record() {
		return this.#wrapper.records[this.#id]
	}

	get lastFetchedAt() {
		return this.#wrapper.lastFetchedAt
	}
}
