---
type: model
resource: "okam://model/CategoryProductListItem"
title: "Category Product List Item"
description: "Shared class `CategoryProductListItem` (8 field(s)) from the okam Core library."
domain: category
authority_tier: source
data_classification: schema-only
source_ref: "models/category/category-product-list-item.ts:3"
tags:
  - category
  - model
  - class
---

TypeScript class `CategoryProductListItem` (vendored into okam clients via the Core library).

# Fields

| Field | Type | Optional |
| --- | --- | --- |
| `id` | `string` | no |
| `orderIndex` | `number` | no |
| `isHeading` | `boolean` | no |
| `heading` | `string` | no |
| `productId` | `string` | no |
| `product` | `Product` | no |
| `categoryId` | `string` | no |
| `category` | `Category` | no |
