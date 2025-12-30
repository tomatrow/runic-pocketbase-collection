import { createSubscriber } from "svelte/reactivity"
import type {
	ClientResponseError,
	RecordModel,
	RecordService,
	RecordSubscribeOptions,
	SendOptions
} from "pocketbase"
import type { UpdateOverride, RecordUpdate } from "./common.js"

export class RunicRecordService<M extends RecordModel = RecordModel> {
	service: RecordService<M>
	records = $state<Record<string, M>>({})
	#subscribe: () => void
	#overrides = $state<UpdateOverride<Record<string, M>>[]>([])
	#recordsWithOverride = $derived(
		this.#overrides.reduce((records, override) => override(records), this.records)
	)

	constructor(recordService: RecordService<M>, topic: string, options?: RecordSubscribeOptions) {
		this.service = recordService
		this.#subscribe = createSubscriber((update) => {
			const unsubscribePromise = this.service.subscribe(
				topic,
				({ action, record }) => {
					switch (action) {
						case "delete":
							delete this.records[record.id]
							update()
							break
						case "create":
						case "update":
							this.records[record.id] = record
							update()
							break
						default:
							console.warn(`Unknown action: '${action}'`)
					}
				},
				options
			)

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
			await batch.send(options)
		} catch (error) {
			onError?.(error as ClientResponseError)
		} finally {
			if (override) this.#overrides.splice(this.#overrides.indexOf(override), 1)
		}
	}

	getRecords() {
		this.#subscribe()
		return this.#recordsWithOverride
	}
}
