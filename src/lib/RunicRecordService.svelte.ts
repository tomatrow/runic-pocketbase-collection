import { untrack } from "svelte"
import { createSubscriber } from "svelte/reactivity"
import type {
	ClientResponseError,
	RecordModel,
	RecordService,
	RecordSubscribeOptions,
	SendOptions
} from "pocketbase"
import type { RecordUpdate, RequestConfig } from "./common.js"

/**
 * Reactive wrapper around PocketBase's RecordService with real-time sync and optimistic updates.
 * Subscribes to collection changes and maintains a reactive record store.
 */
export class RunicRecordService<M extends RecordModel = RecordModel> {
	/** Underlying PocketBase RecordService instance */
	service: RecordService<M>
	/** Internal reactive store of records keyed by ID */
	#records = $state<Record<string, M>>({})
	/** Subscription/request options passed to PocketBase */
	#options?: RecordSubscribeOptions
	/** Function to fetch records from the server */
	#fetchRecords: (options?: SendOptions) => Promise<M[]>
	/** Subscriber function created by createSubscriber that manages real-time subscription lifecycle */
	#subscribe: () => void
	/** Stack of override functions for optimistic updates */
	#overrides = $state<Array<(prev: Record<string, M>) => Record<string, M>>>([])
	/** Derived records with all pending optimistic overrides applied */
	#recordsWithOverride = $derived(
		this.#overrides.reduce((records, override) => override(records), this.#records)
	)

	/**
	 * Creates a new RunicRecordService instance.
	 * @param recordService - PocketBase RecordService instance to wrap
	 * @param topic - Subscription topic (e.g., "*" for all records, or a specific record ID)
	 * @param config - Configuration options
	 * @param config.autoRefetch - Whether to refetch records when subscription starts (default: true)
	 * @param config.fetchRecords - Function to fetch records from the server
	 * @param config.options - PocketBase request/subscription options
	 * @param config.onError - Error handler callback (default: console.error)
	 */
	constructor(
		recordService: RecordService<M>,
		topic: string,
		{
			autoRefetch = true,
			fetchRecords,
			options,
			onError = console.error
		}: {
			autoRefetch?: boolean
			fetchRecords(options?: RecordSubscribeOptions): Promise<M[]>
			options?: RecordSubscribeOptions
			onError?(error: ClientResponseError): void
		}
	) {
		this.service = recordService
		this.#options = options
		this.#fetchRecords = fetchRecords
		this.#subscribe = createSubscriber(update => {
			const unsubscribePromise = this.service.subscribe(
				topic,
				({ action, record }) => {
					switch (action) {
						case "delete":
							delete this.#records[record.id]
							update()
							break
						case "create":
						case "update":
							this.#records[record.id] = record
							update()
							break
						default:
							console.warn(`Unknown action: '${action}'`)
					}
				},
				this.#options
			)

			if (autoRefetch) this.refetch({ onError, options })

			return () => {
				unsubscribePromise.then(unsubscribe => unsubscribe())
			}
		})
	}

	/**
	 * Performs an optimistic batch update on the record store.
	 * Applies changes to the UI immediately while the request is in flight.
	 * @param updateAction - Function that receives current records and returns a diff object.
	 *   Keys are record IDs, values are partial updates (null = delete).
	 * @param config - Optional request configuration
	 * @returns Promise that resolves when the batch request completes
	 */
	async update(
		updateAction: (prev: Record<string, M>) => Record<string, RecordUpdate<M> | null>,
		{ options, onError = console.error }: RequestConfig = {}
	) {
		const updateValue = $state.snapshot(updateAction(untrack(() => this.#recordsWithOverride)))
		const override = createOverride(updateAction)

		untrack(() => this.#overrides.push(override))

		try {
			const batch = this.service.client.createBatch()
			const batchCollection = batch.collection(this.service.collectionIdOrName)

			Object.entries(updateValue).forEach(([id, recordUpdate]) => {
				if (recordUpdate) batchCollection.upsert({ ...recordUpdate, id })
				else batchCollection.delete(id)
			})

			await batch.send({ ...this.#options, ...options })
		} catch (error) {
			onError?.(error as ClientResponseError)
		}

		untrack(() => this.#overrides.splice(this.#overrides.indexOf(override), 1))
	}

	/**
	 * Manually refetches all records from the server.
	 * Clears the existing store and repopulates it with fresh data.
	 * @param config - Optional request configuration
	 * @returns Promise that resolves when the fetch completes
	 */
	async refetch({ options, onError = console.error }: RequestConfig = {}) {
		try {
			const list = await this.#fetchRecords({ ...this.#options, ...options })

			// clear out old records and save new ones
			// while also not breaking $state link
			// (see https://svelte.dev/docs/svelte/context#Using-context-with-state)
			for (const id in this.#records) delete this.#records[id]
			for (const record of list) this.#records[record.id] = record
		} catch (error) {
			onError?.(error as ClientResponseError)
		}
	}

	/**
	 * Reactive record store. Accessing this property triggers the real-time subscription.
	 * @returns Record object with all records keyed by ID, including pending optimistic updates
	 */
	get records() {
		this.#subscribe()
		return this.#recordsWithOverride
	}
}

/**
 * Creates an override function that applies optimistic changes to the record store.
 * @param updateAction - The update action to convert into an override
 * @returns Override function that transforms records by applying the diff
 */
function createOverride<M>(
	updateAction: (prev: Record<string, M>) => Record<string, RecordUpdate<M> | null>
) {
	return function override(prevRecords: Record<string, M>) {
		const nextRecords = { ...prevRecords }

		const diff = $state.snapshot(updateAction(prevRecords)) as Record<
			string,
			RecordUpdate<M> | null
		>
		for (const [recordId, recordUpdate] of Object.entries(diff)) {
			if (recordUpdate === null) {
				delete nextRecords[recordId]
			} else if (prevRecords[recordId]) {
				const updatedRecord = Object.fromEntries(
					Object.entries({ ...nextRecords[recordId], ...recordUpdate }).filter(
						([, value]) => value !== null
					)
				)
				nextRecords[recordId] = updatedRecord as M
			} else {
				const newRecord = recordUpdate
				nextRecords[recordId] = newRecord as M
			}
		}

		return nextRecords
	}
}
