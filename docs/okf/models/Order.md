---
type: model
resource: "okam://model/Order"
title: "Order"
description: "Shared class `Order` (51 field(s)) from the okam Core library."
domain: order
authority_tier: source
data_classification: schema-only
source_ref: "models/order/order.ts:4"
tags:
  - order
  - model
  - class
---

TypeScript class `Order` (vendored into okam clients via the Core library).

# Fields

| Field | Type | Optional |
| --- | --- | --- |
| `id` | `string` | no |
| `friendlyOrderId` | `string` | no |
| `dineHomeOrderId` | `string` | no |
| `created` | `Date` | no |
| `requestedCompletion` | `Date` | no |
| `processingStartTime` | `Date` | no |
| `estimatedProcessingEndTime` | `Date` | no |
| `processingEndTime` | `Date` | no |
| `completed` | `Date` | no |
| `isInPreorderMode` | `boolean` | no |
| `platform` | `string` | no |
| `userId` | `string` | no |
| `storeId` | `number` | no |
| `originalStoreId` | `number` | no |
| `status` | `OrderStatus` | no |
| `dineHomeStatus` | `DineHomeStatus` | no |
| `items` | `Array<OrderLineItem>` | no |
| `taxDetails` | `Array<TaxDetail>` | no |
| `paymentIntentId` | `string` | no |
| `vippsOrderId` | `string` | no |
| `tableName` | `string` | no |
| `dateTimeNow` | `Date` | no |
| `countdownEndTime` | `Date` | no |
| `pickup` | `Date` | no |
| `itemsAmount` | `number` | no |
| `itemsAmountLineThrough` | `number` | no |
| `orderDiscountAmount` | `number` | no |
| `deliveryAmount` | `number` | no |
| `serviceFeeAmount` | `number` | no |
| `woltServiceFeeAmount` | `number` | no |
| `finalAmount` | `number` | no |
| `paymentType` | `PaymentType` | no |
| `deliveryType` | `DeliveryType` | no |
| `fullAddress` | `string` | no |
| `zipCode` | `string` | no |
| `city` | `string` | no |
| `storeLegalName` | `string` | no |
| `storeVAT` | `string` | no |
| `storeFullAddress` | `string` | no |
| `storeZipCode` | `string` | no |
| `storeCity` | `string` | no |
| `userIsMember` | `boolean` | no |
| `userFullName` | `string` | no |
| `tipAmount` | `number` | no |
| `usedRewardAmount` | `number` | no |
| `comment` | `string` | no |
| `rewardTransactionId` | `string` | no |
| `rewardTransaction` | `RewardTransaction` | no |
| `woltDeliveryInfo` | `WoltDeliveryInfo` | no |
| `canceledByStore` | `boolean` | no |
| `canReorder` | `boolean` | no |
