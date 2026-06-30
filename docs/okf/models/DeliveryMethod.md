---
type: model
resource: "okam://model/DeliveryMethod"
title: "Delivery Method"
description: "Shared class `DeliveryMethod` (6 field(s)) from the okam Core library."
domain: store
authority_tier: source
data_classification: schema-only
source_ref: "models/store/delivery-method.ts:1"
tags:
  - store
  - model
  - class
---

TypeScript class `DeliveryMethod` (vendored into okam clients via the Core library).

# Fields

| Field | Type | Optional |
| --- | --- | --- |
| `id` | `string` | no |
| `storeId` | `number` | no |
| `minimumDistance` | `number` | no |
| `maxDistance` | `number` | no |
| `amount` | `number` | no |
| `minimumOrderPrice` | `number` | no |
