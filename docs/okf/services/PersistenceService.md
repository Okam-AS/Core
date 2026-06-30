---
type: service
resource: "okam://service/PersistenceService"
title: "Persistence Service"
description: "Shared service `PersistenceService` — 3 public method(s), 0 HTTP call(s) — from the okam Core library."
domain: persistence
authority_tier: source
data_classification: schema-only
source_ref: "services/persistence-service.ts:9"
tags:
  - persistence
  - service
---

TypeScript service `PersistenceService` (vendored into okam clients via the Core library).

# Public methods

* `delete(key: string)`
* `load<T>(key)`
* `watchAndStore(item: any, key: string)`

# HTTP calls

_No HTTP calls (local/utility service)._
