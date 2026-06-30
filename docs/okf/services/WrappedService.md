---
type: service
resource: "okam://service/WrappedService"
title: "Wrapped Service"
description: "Shared service `WrappedService` — 2 public method(s), 2 HTTP call(s) — from the okam Core library."
domain: wrapped
authority_tier: source
data_classification: schema-only
source_ref: "services/wrapped-service.ts:58"
tags:
  - wrapped
  - service
---

TypeScript service `WrappedService` (vendored into okam clients via the Core library).

# Public methods

* `GetWrappedData(storeId: number): Promise<WrappedData>`
* `NotifyViewed(storeId: number): Promise<void>`

# HTTP calls

| Method | Path |
| --- | --- |
| GET | `/wrapped/${storeId}` |
| POST | `/wrapped/notify/${storeId}` |
