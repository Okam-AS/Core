---
type: model
resource: "okam://model/StoreOverviewResponseModel"
title: "Store Overview Response Model"
description: "Shared class `StoreOverviewResponseModel` (3 field(s)) from the okam Core library."
domain: store
authority_tier: source
data_classification: schema-only
source_ref: "models/store/store-overview-response.ts:3"
tags:
  - store
  - model
  - class
---

TypeScript class `StoreOverviewResponseModel` (vendored into okam clients via the Core library).

# Fields

| Field | Type | Optional |
| --- | --- | --- |
| `isKeyAccountManager` | `boolean` | no |
| `isPowerUser` | `boolean` | no |
| `stores` | `StoreOverviewModel[]` | no |
