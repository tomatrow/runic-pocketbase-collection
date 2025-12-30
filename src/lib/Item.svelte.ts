import type {
	ClientResponseError,
	RecordOptions,
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

	constructor(recordService: RecordService<M>, id: string, options?: RecordSubscribeOptions) {
		this.#wrapper = new RunicRecordService(recordService, id, options)
		this.#id = id
	}

	async reload({
		options,
		onError = console.error
	}: {
		options?: RecordOptions
		onError?(error: ClientResponseError): void
	} = {}) {
		try {
			this.#wrapper.records[this.#id] = await this.#wrapper.service.getOne(this.#id, options)
		} catch (error) {
			onError(error as ClientResponseError)
		}
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
		return this.#wrapper.getRecords()[this.#id]
	}
}
