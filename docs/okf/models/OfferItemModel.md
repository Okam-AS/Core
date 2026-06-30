---
type: model
resource: "okam://model/OfferItemModel"
title: "Offer Item Model"
description: "Shared class `OfferItemModel` (25 field(s)) from the okam Core library."
domain: offer
authority_tier: source
data_classification: schema-only
source_ref: "models/offer/offer-item-model.ts:1"
tags:
  - offer
  - model
  - class
---

TypeScript class `OfferItemModel` (vendored into okam clients via the Core library).

# Fields

| Field | Type | Optional |
| --- | --- | --- |
| `offerItemId` | `string` | yes |
| `name` | `string` | no |
| `description` | `string` | no |
| `internalDescription` | `string` | no |
| `enableMonthlyFee` | `boolean` | no |
| `enableOnetimeFee` | `boolean` | no |
| `minMonthlyFee` | `number` | no |
| `minOnetimeFee` | `number` | no |
| `maxMonthlyFee` | `number` | no |
| `maxOnetimeFee` | `number` | no |
| `onetimeBonusToSeller` | `number` | no |
| `monthlyBonusToSeller` | `number` | no |
| `oneTimeBonusToSellersManager` | `number` | no |
| `monthlyBonusToSellersManager` | `number` | no |
| `onetimePercentBonusToSeller` | `number` | no |
| `monthlyPercentBonusToSeller` | `number` | no |
| `onetimePercentBonusToSellersManager` | `number` | no |
| `monthlyPercentBonusToSellersManager` | `number` | no |
| `createdAt` | `Date` | no |
| `createdBy` | `string` | no |
| `createdByName` | `string` | no |
| `updatedAt` | `Date` | yes |
| `updatedBy` | `string` | yes |
| `updatedByName` | `string` | yes |
| `inactive` | `boolean` | no |
