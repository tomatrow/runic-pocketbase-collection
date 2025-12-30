export type UpdateOverride<T> = (prev: T) => T

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
