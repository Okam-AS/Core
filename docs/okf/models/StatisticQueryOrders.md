---
type: model
resource: "okam://model/StatisticQueryOrders"
title: "Statistic Query Orders"
description: "Shared class `StatisticQueryOrders` (7 field(s)) from the okam Core library."
domain: statistic
authority_tier: source
data_classification: schema-only
source_ref: "models/statistic/statistic-query-orders.ts:3"
tags:
  - statistic
  - model
  - class
---

TypeScript class `StatisticQueryOrders` (vendored into okam clients via the Core library).

# Fields

| Field | Type | Optional |
| --- | --- | --- |
| `storeId` | `number` | no |
| `from` | `string` | no |
| `to` | `string` | no |
| `statuses` | `Array<OrderStatusFilter>` | no |
| `paymentTypes` | `Array<OrderPaymentTypeFilter>` | no |
| `deliveryTypes` | `Array<DeliveryType>` | no |
| `includeItems` | `boolean` | no |
