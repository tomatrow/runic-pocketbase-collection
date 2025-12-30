import { createSubscriber, SvelteDate } from "svelte/reactivity"
import type {
	ClientResponseError,
	RecordModel,
	RecordService,
	RecordSubscribeOptions,
	SendOptions
} from "pocketbase"
import type { UpdateOverride, RecordUpdate } from "./common.js"

export class RunicRecordService<M extends RecordModel = RecordModel> {
	lastFetchedAt = $state<Date>()
	service: RecordService<M>
	#records = $state<Record<string, M>>({})
	#options?: RecordSubscribeOptions
	#fetchRecords: (options?: SendOptions) => Promise<M[]>
	#subscribe: () => void
	#overrides = $state<UpdateOverride<Record<string, M>>[]>([])
	#recordsWithOverride = $derived(
		this.#overrides.reduce((records, override) => override(records), this.#records)
	)

	constructor(
		recordService: RecordService<M>,
		topic: string,
		{
			autoRefetch = true,
			fetchRecords,
			options,
			onError
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
		this.#subscribe = createSubscriber((update) => {
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
				unsubscribePromise.then((unsubscribe) => unsubscribe())
			}
		})
	}

	async update(
		recordsUpdate: Record<string, RecordUpdate<M> | null>,
		{
			options,
			override: overrideProp,
			onError
		}: {
			options?: SendOptions
			override?: UpdateOverride<Record<string, M>>
			onError?(error: ClientResponseError): void
		} = {}
	) {
		const batch = this.service.client.createBatch()
		const batchCollection = batch.collection(this.service.collectionIdOrName)

		Object.entries($state.snapshot(recordsUpdate)).forEach(([id, recordUpdate]) => {
			if (recordUpdate) batchCollection.upsert({ ...recordUpdate, id })
			else batchCollection.delete(id)
		})

		// ensure override is unique to this batch
		const override = overrideProp && ((prev: Record<string, M>) => overrideProp(prev))

		try {
			if (override) this.#overrides.push(override)
			await batch.send({ ...this.#options, ...options })
		} catch (error) {
			onError?.(error as ClientResponseError)
		} finally {
			if (override) this.#overrides.splice(this.#overrides.indexOf(override), 1)
		}
	}

	async refetch({
		options,
		onError
	}: {
		options?: SendOptions
		onError?(error: ClientResponseError): void
	} = {}) {
		try {
			const list = await this.#fetchRecords({ ...this.#options, ...options })
			this.lastFetchedAt = new SvelteDate()

			// clear out old records and save new ones
			// while also not breaking $state link
			// (see https://svelte.dev/docs/svelte/context#Using-context-with-state)
			for (const id in this.#records) delete this.#records[id]
			for (const record of list) this.#records[record.id] = record
		} catch (error) {
			onError?.(error as ClientResponseError)
		}
	}

	get records() {
		this.#subscribe()
		return this.#recordsWithOverride
	}
}
