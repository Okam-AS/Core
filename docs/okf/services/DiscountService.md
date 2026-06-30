---
type: service
resource: "okam://service/DiscountService"
title: "Discount Service"
description: "Shared service `DiscountService` — 4 public method(s), 3 HTTP call(s) — from the okam Core library."
domain: discount
authority_tier: source
data_classification: schema-only
source_ref: "services/discount-service.ts:5"
tags:
  - discount
  - service
---

TypeScript service `DiscountService` (vendored into okam clients via the Core library).

# Public methods

* `CreateOrUpdate(discount: Discount): Promise<Discount>`
* `Delete(id: string): Promise<void>`
* `Exists(storeId: Number, discountCode: string): Promise<boolean>`
* `Get(storeId: number): Promise<Array<Discount>>`

# HTTP calls

| Method | Path |
| --- | --- |
| POST | `/discount` |
| DELETE | `/discount/` |
| GET | `/discount/store/` |
