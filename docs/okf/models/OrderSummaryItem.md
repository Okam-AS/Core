---
type: model
resource: "okam://model/OrderSummaryItem"
title: "Order Summary Item"
description: "Shared class `OrderSummaryItem` (5 field(s)) from the okam Core library."
domain: statistic
authority_tier: source
data_classification: schema-only
source_ref: "models/statistic/order-summary-item.ts:3"
tags:
  - statistic
  - model
  - class
---

TypeScript class `OrderSummaryItem` (vendored into okam clients via the Core library).

# Fields

| Field | Type | Optional |
| --- | --- | --- |
| `quantity` | `number` | no |
| `name` | `string` | no |
| `currency` | `string` | no |
| `amount` | `number` | no |
| `options` | `Array<OrderSummaryItemOption>` | no |
