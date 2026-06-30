---
type: model
resource: "okam://model/CartCalculation"
title: "Cart Calculation"
description: "Shared class `CartCalculation` (15 field(s)) from the okam Core library."
domain: cart
authority_tier: source
data_classification: schema-only
source_ref: "models/cart/cart-calculation.ts:1"
tags:
  - cart
  - model
  - class
---

TypeScript class `CartCalculation` (vendored into okam clients via the Core library).

# Fields

| Field | Type | Optional |
| --- | --- | --- |
| `itemsAmount` | `number` | no |
| `itemsAmountLineThrough` | `number` | no |
| `deliveryAmount` | `number` | no |
| `tableAdditionalAmount` | `number` | no |
| `deliveryAdditionalAmount` | `number` | no |
| `orderDiscountAmount` | `number` | no |
| `tipAmount` | `number` | no |
| `serviceFeeAmount` | `number` | no |
| `woltServiceFeeAmount` | `number` | no |
| `rewardAmountSpent` | `number` | no |
| `earnableRewardAmount` | `number` | no |
| `rewardBalanceBeforeOrder` | `number` | no |
| `usedGiftcardAmount` | `number` | no |
| `giftcardBalanceBeforeOrder` | `number` | no |
| `finalAmount` | `number` | no |
