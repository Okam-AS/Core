---
type: model
resource: "okam://model/StatisticOrders"
title: "Statistic Orders"
description: "Shared class `StatisticOrders` (3 field(s)) from the okam Core library."
domain: statistic
authority_tier: source
data_classification: schema-only
source_ref: "models/statistic/statistic-orders.ts:3"
tags:
  - statistic
  - model
  - class
---

TypeScript class `StatisticOrders` (vendored into okam clients via the Core library).

# Fields

| Field | Type | Optional |
| --- | --- | --- |
| `filter` | `StatisticQueryOrders` | no |
| `charts` | `Array<StatisticChart>` | no |
| `ordersSummary` | `Array<OrderSummaryItem>` | no |
