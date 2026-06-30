---
type: service
resource: "okam://service/WoltService"
title: "Wolt Service"
description: "Shared service `WoltService` — 1 public method(s), 1 HTTP call(s) — from the okam Core library."
domain: wolt
authority_tier: source
data_classification: schema-only
source_ref: "services/wolt-service.ts:4"
tags:
  - wolt
  - service
---

TypeScript service `WoltService` (vendored into okam clients via the Core library).

# Public methods

* `getOrders(page: number = 1, pageSize: number = 20): Promise<`

# HTTP calls

| Method | Path |
| --- | --- |
| GET | `/wolt/orders?page=${page}&pageSize=${pageSize}` |
