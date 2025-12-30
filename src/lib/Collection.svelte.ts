import type {
	ClientResponseError,
	RecordModel,
	RecordService,
	RecordSubscribeOptions,
	SendOptions
} from "pocketbase"
import { RunicRecordService } from "./RunicRecordService.svelte.js"
import type { UpdateOverride, RecordUpdate } from "./common.js"

export class Collection<M extends RecordModel = RecordModel> {
	#service: RunicRecordService<M>

	constructor(
		recordService: RecordService<M>,
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
		this.#service = new RunicRecordService(recordService, "*", {
			options,
			onError,
			autoRefetch,
			fetchRecords: (options) => recordService.getFullList(options)
		})
	}

	async refetch({
		options,
		onError = console.error
	}: {
		options?: SendOptions
		onError?(error: ClientResponseError): void
	} = {}) {
		await this.#service.refetch({ options, onError })
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
		await this.#service.update(recordsUpdate, { options, override, onError })
	}

	get records() {
		return this.#service.records
	}

	get lastFetchedAt() {
		return this.#service.lastFetchedAt
	}
}
