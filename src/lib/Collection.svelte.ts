import type {
	ClientResponseError,
	RecordModel,
	RecordService,
	RecordSubscribeOptions
} from "pocketbase"
import type { RecordUpdate, RequestConfig } from "./common.js"
import { RunicRecordService } from "./RunicRecordService.svelte.js"

/**
 * Reactive wrapper for a full PocketBase collection with real-time sync and optimistic updates.
 * Subscribes to all records in the collection and maintains a reactive store.
 */
export class Collection<M extends RecordModel = RecordModel> {
	/** Underlying RunicRecordService instance */
	#service: RunicRecordService<M>

	/**
	 * Creates a new Collection instance.
	 * @param recordService - PocketBase RecordService instance to wrap
	 * @param config - Configuration options
	 * @param config.autoRefetch - Whether to refetch records when subscription starts (default: true)
	 * @param config.options - PocketBase request/subscription options
	 * @param config.onError - Error handler callback (default: console.error)
	 */
	constructor(
		recordService: RecordService<M>,
		config?: {
			autoRefetch?: boolean
			options?: RecordSubscribeOptions
			onError?(error: ClientResponseError): void
		}
	) {
		this.#service = new RunicRecordService(recordService, "*", {
			...config,
			fetchRecords: options => recordService.getFullList(options)
		})
	}

	/**
	 * Manually refetches all records from the server.
	 * @param config - Optional request configuration
	 * @param config.options - PocketBase request/subscription options
	 * @param config.onError - Error handler callback (default: console.error)
	 * @returns Promise that resolves when the fetch completes
	 */
	refetch(config?: RequestConfig) {
		return this.#service.refetch(config)
	}

	/**
	 * Performs an optimistic batch update on the collection.
	 * @param recordsUpdate - Either a static diff object or a function that receives current records
	 *   and returns a diff. Keys are record IDs, values are partial updates (null = delete).
	 * @param config - Optional request configuration
	 * @param config.options - PocketBase request/subscription options
	 * @param config.onError - Error handler callback (default: console.error)
	 * @returns Promise that resolves when the batch request completes
	 */
	update(
		recordsUpdate:
			| Record<string, RecordUpdate<M> | null>
			| ((prev: Record<string, M>) => Record<string, RecordUpdate<M> | null>),
		config?: RequestConfig
	) {
		return this.#service.update(
			typeof recordsUpdate === "function" ? recordsUpdate : () => recordsUpdate,
			config
		)
	}

	/**
	 * Reactive record store. Accessing this property triggers the real-time subscription.
	 * @returns Record object with all records keyed by ID, including pending optimistic updates
	 */
	get records() {
		return this.#service.records
	}
}
