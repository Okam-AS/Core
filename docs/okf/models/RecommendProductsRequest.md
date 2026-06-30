---
type: model
resource: "okam://model/RecommendProductsRequest"
title: "Recommend Products Request"
description: "Shared class `RecommendProductsRequest` (5 field(s)) from the okam Core library."
domain: cart
authority_tier: source
data_classification: schema-only
source_ref: "models/cart/recommend-products-request.ts:3"
tags:
  - cart
  - model
  - class
---

TypeScript class `RecommendProductsRequest` (vendored into okam clients via the Core library).

# Fields

| Field | Type | Optional |
| --- | --- | --- |
| `items` | `Array<CartLineItem>` | no |
| `searchOptions` | `CategorySearchOptions` | no |
| `storeId` | `number` | no |
| `userId` | `string` | no |
| `cartDiscountCode` | `string` | no |
