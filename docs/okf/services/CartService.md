---
type: service
resource: "okam://service/CartService"
title: "Cart Service"
description: "Shared service `CartService` — 9 public method(s), 9 HTTP call(s) — from the okam Core library."
domain: cart
authority_tier: source
data_classification: schema-only
source_ref: "services/cart-service.ts:5"
tags:
  - cart
  - service
---

TypeScript service `CartService` (vendored into okam clients via the Core library).

# Public methods

* `Complete(storeId: number): Promise<Order>`
* `Delete(storeId: Number): Promise<boolean>`
* `GetByStoreId(storeId: number): Promise<Cart>`
* `GetCartLineItem(cartLineItem: CartLineItem): Promise<CartLineItem>`
* `GetRecommendations(model: RecommendProductsRequest): Promise<Array<Product>>`
* `ReorderFromOrder(orderId: string | number): Promise<Cart>`
* `Update(model: Cart): Promise<Cart>`
* `UpdateCompanyInfo(storeId: number, model: UpdateCompanyInfoModel): Promise<UpdateCompanyInfoModel>`
* `Validate(storeId: number): Promise<CartValidation>`

# HTTP calls

| Method | Path |
| --- | --- |
| PUT | `/carts` |
| DELETE | `/carts/` |
| GET | `/carts/` |
| POST | `/carts/complete/` |
| POST | `/carts/lineItem` |
| POST | `/carts/recommendations` |
| POST | `/carts/reorder/` |
| POST | `/carts/updateCompanyInfo/` |
| GET | `/carts/validate/` |
