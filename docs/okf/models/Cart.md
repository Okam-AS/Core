---
type: model
resource: "okam://model/Cart"
title: "Cart"
description: "Shared class `Cart` (31 field(s)) from the okam Core library."
domain: cart
authority_tier: source
data_classification: schema-only
source_ref: "models/cart/cart.ts:3"
tags:
  - cart
  - model
  - class
---

TypeScript class `Cart` (vendored into okam clients via the Core library).

# Fields

| Field | Type | Optional |
| --- | --- | --- |
| `id` | `string` | no |
| `items` | `Array<CartLineItem>` | no |
| `storeId` | `number` | no |
| `requestedCompletion` | `Date` | yes |
| `homeDeliveryMethodId` | `string` | yes |
| `homeDeliveryMethod` | `DeliveryMethod` | yes |
| `ignoreLegecyIsSelfPickupBool` | `boolean` | no |
| `deliveryType` | `DeliveryType` | no |
| `ignoreLegecyIsWaiterOrderBool` | `boolean` | no |
| `paymentType` | `PaymentType` | no |
| `discountCode` | `string` | yes |
| `fullAddress` | `string` | yes |
| `zipCode` | `string` | yes |
| `city` | `string` | yes |
| `deliveryInstructions` | `string` | yes |
| `paymentIntentId` | `string` | yes |
| `vippsOrderId` | `string` | yes |
| `comment` | `string` | yes |
| `tipPercent` | `number` | no |
| `tipAmount` | `number` | no |
| `tableName` | `string` | yes |
| `useReward` | `boolean` | no |
| `isHomeDelivery` | `boolean` | no |
| `itemsCountInCategory` | `any` | no |
| `companyEmail` | `string` | no |
| `companyName` | `string` | no |
| `companyVat` | `string` | no |
| `companyAddress` | `string` | no |
| `companyZipCode` | `string` | no |
| `companyCity` | `string` | no |
| `calculations` | `CartCalculation` | no |
