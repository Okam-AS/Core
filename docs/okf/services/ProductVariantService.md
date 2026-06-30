---
type: service
resource: "okam://service/ProductVariantService"
title: "Product Variant Service"
description: "Shared service `ProductVariantService` — 3 public method(s), 3 HTTP call(s) — from the okam Core library."
domain: product
authority_tier: source
data_classification: schema-only
source_ref: "services/product-variant-service.ts:5"
tags:
  - product
  - service
---

TypeScript service `ProductVariantService` (vendored into okam clients via the Core library).

# Public methods

* `CreateOrUpdate(productId: string, productVariants: Array<ProductVariant>): Promise<ProductVariant>`
* `Delete(productVariantId: string): Promise<void>`
* `Reorder(productId: string, productVariants: Array<ProductVariant>): Promise<Product>`

# HTTP calls

| Method | Path |
| --- | --- |
| POST | `/productvariants` |
| DELETE | `/productvariants/` |
| PUT | `/productvariants/reorder` |
