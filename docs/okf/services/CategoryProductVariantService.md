---
type: service
resource: "okam://service/CategoryProductVariantService"
title: "Category Product Variant Service"
description: "Shared service `CategoryProductVariantService` — 3 public method(s), 3 HTTP call(s) — from the okam Core library."
domain: category
authority_tier: source
data_classification: schema-only
source_ref: "services/category-product-variant-service.ts:5"
tags:
  - category
  - service
---

TypeScript service `CategoryProductVariantService` (vendored into okam clients via the Core library).

# Public methods

* `CreateOrUpdate(categoryId: string, productVariants: Array<ProductVariant>): Promise<ProductVariant>`
* `Delete(productVariantId: string): Promise<void>`
* `Reorder(categoryId: string, productVariants: Array<ProductVariant>): Promise<Product>`

# HTTP calls

| Method | Path |
| --- | --- |
| POST | `/categoryproductvariants` |
| DELETE | `/categoryproductvariants/` |
| PUT | `/categoryproductvariants/reorder` |
