import { createSubscriber } from "svelte/reactivity"
import type {
	RecordService,
	RecordModel,
	RecordSubscribeOptions,
	SendOptions,
	RecordFullListOptions
} from "pocketbase"

export class Collection<M extends RecordModel = RecordModel> {
	#recordService: RecordService<M>
	#options?: RecordSubscribeOptions
	#subscribe: () => void
	#records = $state<Record<string, M>>({})
	#inflightUpdates = $state<Record<string, { count: number; latestRecord: M | null }>>({})
	#optimisticRecords = $derived(
		Object.fromEntries(
			Object.keys({ ...this.#records, ...this.#inflightUpdates })
				.map((id) => {
					const record = this.#inflightUpdates[id]
						? this.#inflightUpdates[id].latestRecord
						: this.#records[id]
					if (!record) return
					return [id, record] as [string, M]
				})
				.filter((entry) => entry !== undefined)
		)
	)

	constructor(recordService: RecordService<M>, options?: RecordSubscribeOptions) {
		this.#options = options
		this.#recordService = recordService
		this.#subscribe = createSubscriber((update) => {
			this.reload(this.#options)

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
					}
				},
				this.#options
			)

			return () => {
				unsubscribePromise.then((unsubscribe) => unsubscribe())
			}
		})
	}

	async reload(options?: RecordFullListOptions) {
		const records = await this.#recordService.getFullList(options ?? this.#options)
		for (const record of records) this.#records[record.id] = record
	}

	async update(
		recordsUpdate: Record<string, RecordUpdate<M> | null>,
		options?: SendOptions | ((id: string) => SendOptions | undefined)
	) {
		const results = await Promise.allSettled(
			Object.entries(recordsUpdate).map(async ([id, recordUpdate]) => {
				options ??= this.#options
				if (typeof options === "function") options = options(id)

				if (recordUpdate) {
					const prevRecord = this.#optimisticRecords[id]
					const recordUpdateSnapshot = $state.snapshot(recordUpdate) as RecordUpdate<M>

					if (prevRecord) {
						const prevRecordSnapshot = $state.snapshot(prevRecord) as M
						const updatedRecord = defaultsDeep(
							structuredClone(prevRecordSnapshot),
							// @ts-expect-error why
							recordUpdateSnapshot
						)
						if (deepEqual(prevRecordSnapshot, updatedRecord)) return

						this.#inflightUpdates[id] = {
							count: (this.#inflightUpdates[id]?.count ?? 0) + 1,
							latestRecord: updatedRecord
						}

						try {
							await this.#recordService.update(id, updatedRecord, options)
						} finally {
							if (this.#inflightUpdates[id]) {
								this.#inflightUpdates[id].count--
								if (this.#inflightUpdates[id].count === 0) delete this.#inflightUpdates[id]
							}
						}
					} else {
						await this.#recordService.create({ ...recordUpdateSnapshot, id }, options)
					}
				} else {
					delete this.#inflightUpdates[id]
					await this.#recordService.delete(id, options)
				}
			})
		)

		const errors = results
			.filter((result) => result.status === "rejected")
			.map((result) => result.reason)
		if (errors.length) throw new AggregateError(errors, `${errors.length} errors during update`)
	}

	get records() {
		this.#subscribe()
		return this.#optimisticRecords
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

/**
 * Performs a deep equality comparison between two values.
 * Recursively compares objects and arrays, handling null/undefined cases.
 *
 * @param a - First value to compare
 * @param b - Second value to compare
 * @returns true if values are deeply equal, false otherwise
 */
function deepEqual(a: unknown, b: unknown): boolean {
	if (a === b) return true
	if (a == null || b == null) return false
	if (typeof a !== typeof b) return false

	if (typeof a !== "object") return false

	if (Array.isArray(a) !== Array.isArray(b)) return false

	if (Array.isArray(a) && Array.isArray(b)) {
		if (a.length !== b.length) return false
		for (let i = 0; i < a.length; i++) if (!deepEqual(a[i], b[i])) return false
		return true
	}

	const keysA = Object.keys(a)
	const keysB = Object.keys(b)
	if (keysA.length !== keysB.length) return false

	for (const key of keysA) {
		if (!keysB.includes(key)) return false
		if (!deepEqual((a as Record<string, unknown>)[key], (b as Record<string, unknown>)[key]))
			return false
	}

	return true
}

/**
 * Recursively merges properties from multiple source objects into target object.
 * - Undefined values in source will delete the corresponding property in target
 * - Objects are merged recursively (arrays are replaced entirely)
 * - Sources are applied in order (later sources override earlier ones)
 * - Mutates the target object and returns it
 *
 * @param target - The target object to merge into (will be mutated)
 * @param sources - The source objects containing partial updates
 * @returns The mutated target object
 */
function defaultsDeep<T extends Record<string, unknown>>(
	target: T,
	...sources: DeepPartial<T>[]
): T {
	for (const source of sources)
		for (const key in source) {
			if (!Object.prototype.hasOwnProperty.call(source, key)) continue

			const sourceValue = source[key]
			const targetValue = target[key]

			if (sourceValue === undefined) {
				delete target[key]
			} else if (
				targetValue &&
				typeof targetValue === "object" &&
				!Array.isArray(targetValue) &&
				sourceValue &&
				typeof sourceValue === "object" &&
				!Array.isArray(sourceValue)
			) {
				defaultsDeep(targetValue as Record<string, unknown>, sourceValue)
			} else {
				// @ts-expect-error why
				target[key] = sourceValue
			}
		}

	return target
}
