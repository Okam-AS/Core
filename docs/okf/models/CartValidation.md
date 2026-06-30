---
type: model
resource: "okam://model/CartValidation"
title: "Cart Validation"
description: "Shared class `CartValidation` (13 field(s)) from the okam Core library."
domain: cart
authority_tier: source
data_classification: schema-only
source_ref: "models/cart/cart-validation.ts:2"
tags:
  - cart
  - model
  - class
---

TypeScript class `CartValidation` (vendored into okam clients via the Core library).

# Fields

| Field | Type | Optional |
| --- | --- | --- |
| `itemsOutOfStock` | `Array<Product>` | no |
| `deliveryAddressError` | `boolean` | no |
| `deliveryMethodError` | `boolean` | no |
| `priceDifferError` | `boolean` | no |
| `priceTooLowError` | `boolean` | no |
| `storeIsClosed` | `boolean` | no |
| `sameDayAfterHoursOrderNotAllowed` | `boolean` | no |
| `cartIsEmpty` | `boolean` | no |
| `itemsInStock` | `boolean` | no |
| `paymentTypeError` | `boolean` | no |
| `giftcardBalanceTooLow` | `boolean` | no |
| `hasErrors` | `boolean` | no |
| `minimumPrice` | `number` | no |
