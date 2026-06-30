---
type: model
resource: "okam://model/ProductVariant"
title: "Product Variant"
description: "Shared class `ProductVariant` (8 field(s)) from the okam Core library."
domain: product
authority_tier: source
data_classification: schema-only
source_ref: "models/product/product-variant.ts:3"
tags:
  - product
  - model
  - class
---

TypeScript class `ProductVariant` (vendored into okam clients via the Core library).

# Fields

| Field | Type | Optional |
| --- | --- | --- |
| `id` | `string` | no |
| `orderIndex` | `number` | no |
| `name` | `string` | no |
| `options` | `Array<ProductVariantOption>` | no |
| `multiselect` | `boolean` | no |
| `required` | `boolean` | no |
| `productId` | `string` | no |
| `hasError` | `boolean` | no |
