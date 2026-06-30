---
type: model
resource: "okam://model/OrderLineItem"
title: "Order Line Item"
description: "Shared class `OrderLineItem` (14 field(s)) from the okam Core library."
domain: order
authority_tier: source
data_classification: schema-only
source_ref: "models/order/order-line-item.ts:3"
tags:
  - order
  - model
  - class
---

TypeScript class `OrderLineItem` (vendored into okam clients via the Core library).

# Fields

| Field | Type | Optional |
| --- | --- | --- |
| `id` | `string` | no |
| `productId` | `string` | no |
| `image` | `ProductImage` | no |
| `quantity` | `number` | no |
| `notes` | `string` | no |
| `barcode` | `string` | no |
| `name` | `string` | no |
| `description` | `string` | no |
| `currency` | `string` | no |
| `negativeAmount` | `boolean` | no |
| `amount` | `number` | no |
| `amountPreDiscount` | `number` | no |
| `tax` | `number` | no |
| `options` | `Array<OrderLineItemOption>` | no |
