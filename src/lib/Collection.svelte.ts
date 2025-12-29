import { createSubscriber } from "svelte/reactivity"
import {
	ClientResponseError,
	type RecordService,
	type RecordModel,
	type RecordSubscribeOptions,
	type RecordFullListOptions,
	type SendOptions
} from "pocketbase"

export class Collection<M extends RecordModel = RecordModel> {
	#recordService: RecordService<M>
	#subscribe: () => void
	#records = $state<Record<string, M>>({})
	#overrides = $state<UpdateOverride<M>[]>([])

	constructor(recordService: RecordService<M>, options?: RecordSubscribeOptions) {
		this.#recordService = recordService
		this.#subscribe = createSubscriber((update) => {
			const unsubscribePromise = this.#recordService.subscribe(
				"*",
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
				options
			)

			return () => {
				unsubscribePromise.then((unsubscribe) => unsubscribe())
			}
		})
	}

	async reload(options?: RecordFullListOptions) {
		const fullList = await this.#recordService.getFullList(options)
		this.#records = Object.fromEntries(fullList.map((record) => [record.id, record]))
	}

	async update(
		recordsUpdate: Record<string, RecordUpdate<M> | null>,
		{
			options,
			override: overrideProp,
			onError = console.error
		}: {
			options?: SendOptions
			override?: UpdateOverride<M>
			onError?(error: ClientResponseError): void
		} = {}
	) {
		const batch = this.#recordService.client.createBatch()
		const batchCollection = batch.collection(this.#recordService.collectionIdOrName)

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
			onError(error as ClientResponseError)
		} finally {
			if (override) this.#overrides.splice(this.#overrides.indexOf(override), 1)
		}
	}

	get records() {
		this.#subscribe()
		return this.#overrides.reduce((records, override) => override(records), this.#records)
	}
}

/** create 15 character alphanumeric id for pocketbase */
export function pbid() {
	return [...crypto.randomUUID()]
		.filter((char) => char !== "-")
		.slice(0, 15)
		.join("")
}

/** pocketbase interprets nulling a record property as deleting a property */
export type RecordUpdate<M> = {
	[P in Exclude<keyof M, "id" | "collectionId" | "collectionName" | "expand">]?: DeepPartial<
		M[P]
	> | null
}

type DeepPartial<T> = T extends object
	? { [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P] }
	: T

export type UpdateOverride<M> = (prev: Record<string, M>) => Record<string, M>
