# changelog

## 0.0.1

- initial release

## 0.1.0

- fix: ensure `RecordUpdate` type handles diffs with primitives at the top level
- feat: make record expansion a pleasant experience

## 1.0.0

- feat: add `Item` class for single-record reactive subscriptions
- feat: add `pbid()` utility for generating PocketBase-compatible IDs
- feat: export `RecordUpdate` and `RequestConfig` types
- refactor: introduce `RunicRecordService` as shared foundation for `Collection` and `Item`
- fix: properly await refetch promises
- docs: expanded README with installation and usage examples
- fix: `pbid()` now generates IDs with uniform randomness, matching PocketBase's ID generation

## 1.0.1

- docs: added prerequisite documentation for enabling PocketBase Batch API
