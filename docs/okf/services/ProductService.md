---
type: service
resource: "okam://service/ProductService"
title: "Product Service"
description: "Shared service `ProductService` — 11 public method(s), 10 HTTP call(s) — from the okam Core library."
domain: product
authority_tier: source
data_classification: schema-only
source_ref: "services/product-service.ts:6"
tags:
  - product
  - service
---

TypeScript service `ProductService` (vendored into okam clients via the Core library).

# Public methods

* `BulkImport(model: BulkImport): Promise<any>`
* `CreateOrUpdate(product: Product): Promise<Product>`
* `Delete(productId: string): Promise<void>`
* `DeleteImage(productId: string)`
* `Duplicate(productId: string): Promise<Product>`
* `Get(productId: string): Promise<Product>`
* `GetAll(storeId: number): Promise<Array<Product>>`
* `GetByBarcode(storeId: number, barcode: string): Promise<Product>`
* `GetFavoritesWithSearchOptions(storeId: number, searchOptions: { deliveryType?: string } = {}): Promise<Array<Product>>`
* `SearchAcrossStores(query: string, storeIds: number[]): Promise<Array<Product>>`
* `UploadImage(imagePath: string, productId: string)`

# HTTP calls

| Method | Path |
| --- | --- |
| POST | `/products` |
| DELETE | `/products/` |
| GET | `/products/` |
| POST | `/products/` |
| POST | `/products/bulk-import` |
| GET | `/products/consumer/search/` |
| POST | `/products/favorites/` |
| POST | `/products/image` |
| GET | `/products/search/` |
| POST | `/products/search/cross-store` |
