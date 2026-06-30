---
type: model
resource: "okam://model/Product"
title: "Product"
description: "Shared class `Product` (31 field(s)) from the okam Core library."
domain: product
authority_tier: source
data_classification: schema-only
source_ref: "models/product/product.ts:3"
tags:
  - product
  - model
  - class
---

TypeScript class `Product` (vendored into okam clients via the Core library).

# Fields

| Field | Type | Optional |
| --- | --- | --- |
| `id` | `string` | no |
| `name` | `string` | no |
| `description` | `string` | no |
| `hide` | `boolean` | no |
| `hideFromDeliveryTypes` | `Array<DeliveryType>` | no |
| `image` | `ImageSource` | no |
| `barcode` | `string` | no |
| `soldOut` | `boolean` | no |
| `depositAmount` | `number` | no |
| `productVariants` | `Array<ProductVariant>` | no |
| `productVariantEnabled` | `boolean` | no |
| `errorMessage` | `string` | no |
| `selectedOptionsAmount` | `number` | no |
| `selectedOptionNames` | `string` | no |
| `currency` | `string` | no |
| `amount` | `number` | no |
| `baseAmount` | `number` | no |
| `wholeAmount` | `number` | no |
| `fractionAmount` | `string` | no |
| `tax` | `number` | no |
| `otherInformation` | `string` | no |
| `manualRewardAmountEnabled` | `boolean` | no |
| `manualRewardAmount` | `number` | no |
| `hasDiscount` | `boolean` | no |
| `discountLabel` | `string` | no |
| `discountAmount` | `number` | no |
| `storeId` | `number` | no |
| `storeName` | `string` | no |
| `regularDiscountId` | `string` | no |
| `tableAdditionalAmount` | `number` | no |
| `deliveryAdditionalAmount` | `number` | no |
