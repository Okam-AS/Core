---
type: model
resource: "okam://model/Discount"
title: "Discount"
description: "Shared class `Discount` (20 field(s)) from the okam Core library."
domain: discount
authority_tier: source
data_classification: schema-only
source_ref: "models/discount/discount.ts:3"
tags:
  - discount
  - model
  - class
---

TypeScript class `Discount` (vendored into okam clients via the Core library).

# Fields

| Field | Type | Optional |
| --- | --- | --- |
| `id` | `string` | no |
| `storeId` | `number` | no |
| `label` | `string` | no |
| `code` | `string` | no |
| `amount` | `number` | no |
| `type` | `DiscountType` | no |
| `applicability` | `DiscountApplicability` | no |
| `minimumOrderAmountEnabled` | `boolean` | no |
| `minimumOrderAmount` | `number` | no |
| `maximumTotalUsageCountEnabled` | `boolean` | no |
| `maximumTotalUsageCount` | `number` | no |
| `maximumUsagePerCustomerCountEnabled` | `boolean` | no |
| `maximumUsagePerCustomerCount` | `number` | no |
| `giveRewardInsteadOfDiscountEnabled` | `boolean` | no |
| `expired` | `boolean` | no |
| `timedEnabled` | `boolean` | no |
| `validFrom` | `Date` | yes |
| `validTo` | `Date` | yes |
| `discountUsages` | `Array<DiscountUsages>` | no |
| `discountProducts` | `Array<DiscountProducts>` | no |
