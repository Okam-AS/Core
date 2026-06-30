---
type: model
resource: "okam://model/CartLineItem"
title: "Cart Line Item"
description: "Shared class `CartLineItem` (5 field(s)) from the okam Core library."
domain: cart
authority_tier: source
data_classification: schema-only
source_ref: "models/cart/cart-line-item.ts:3"
tags:
  - cart
  - model
  - class
---

TypeScript class `CartLineItem` (vendored into okam clients via the Core library).

# Fields

| Field | Type | Optional |
| --- | --- | --- |
| `id` | `string` | no |
| `product` | `Product` | no |
| `image` | `ProductImage` | no |
| `quantity` | `number` | no |
| `notes` | `string` | no |
