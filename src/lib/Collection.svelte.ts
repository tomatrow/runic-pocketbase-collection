import { createSubscriber } from "svelte/reactivity"
import type {
	ClientResponseError,
	RecordFullListOptions,
	RecordModel,
	RecordOptions,
	RecordService,
	RecordSubscribeOptions,
	SendOptions
} from "pocketbase"

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

/** create 15 character alphanumeric id for pocketbase */
export function pbid() {
	const chars = "abcdefghijklmnopqrstuvwxyz0123456789"
	const bytes = crypto.getRandomValues(new Uint8Array(15))
	return Array.from(bytes, (b) => chars[b % chars.length]).join("")
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

export type UpdateOverride<T> = (prev: T) => T
