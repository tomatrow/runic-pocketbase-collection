import type {
	ClientResponseError,
	RecordModel,
	RecordService,
	RecordSubscribeOptions
} from "pocketbase"
import type { RecordUpdate, RequestConfig } from "./common.js"
import { RunicRecordService } from "./RunicRecordService.svelte.js"

/**
 * Reactive wrapper for a single PocketBase record with real-time sync and optimistic updates.
 * Subscribes to changes on a specific record and maintains a reactive reference.
 */
export class Item<M extends RecordModel = RecordModel> {
	/** Underlying RunicRecordService instance */
	#service: RunicRecordService<M>
	/** ID of the record being tracked */
	#id: string

	/**
	 * Creates a new Item instance.
	 * @param recordService - PocketBase RecordService instance to wrap
	 * @param id - ID of the record to track
	 * @param config - Configuration options
	 * @param config.autoRefetch - Whether to refetch the record when subscription starts (default: true)
	 * @param config.options - PocketBase request/subscription options
	 * @param config.onError - Error handler callback (default: console.error)
	 */
	constructor(
		recordService: RecordService<M>,
		id: string,
		config?: {
			autoRefetch?: boolean
			options?: RecordSubscribeOptions
			onError?(error: ClientResponseError): void
		}
	) {
		this.#service = new RunicRecordService(recordService, id, {
			...config,
			fetchRecords: async options => {
				return [await recordService.getOne(id, options)]
			}
		})
		this.#id = id
	}

	/**
	 * Manually refetches the record from the server.
	 * @param config - Optional request configuration
	 * @param config.options - PocketBase request/subscription options
	 * @param config.onError - Error handler callback (default: console.error)
	 * @returns Promise that resolves when the fetch completes
	 */
	refetch(config?: RequestConfig) {
		return this.#service.refetch(config)
	}

	/**
	 * Performs an optimistic update on the record.
	 * @param recordUpdate - Either a static partial update or a function that receives the current
	 *   record (or undefined if not loaded) and returns a partial update. Use null values to delete fields.
	 * @param config - Optional request configuration
	 * @param config.options - PocketBase request/subscription options
	 * @param config.onError - Error handler callback (default: console.error)
	 * @returns Promise that resolves when the request completes
	 */
	update(recordUpdate: RecordUpdate<M> | ((prev?: M) => RecordUpdate<M>), config?: RequestConfig) {
		return this.#service.update(
			prev => ({
				[this.#id]: typeof recordUpdate === "function" ? recordUpdate(prev[this.#id]) : recordUpdate
			}),
			config
		)
	}

	/**
	 * The reactive record. Accessing this property triggers the real-time subscription.
	 * @returns The record, or undefined if not yet loaded
	 */
	get record() {
		return this.#service.records[this.#id]
	}
}
