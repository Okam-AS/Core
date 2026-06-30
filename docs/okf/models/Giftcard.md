---
type: model
resource: "okam://model/Giftcard"
title: "Giftcard"
description: "Shared class `Giftcard` (27 field(s)) from the okam Core library."
domain: giftcard
authority_tier: source
data_classification: schema-only
source_ref: "models/giftcard/giftcard.ts:4"
tags:
  - giftcard
  - model
  - class
---

TypeScript class `Giftcard` (vendored into okam clients via the Core library).

# Fields

| Field | Type | Optional |
| --- | --- | --- |
| `giftcardId` | `string` | yes |
| `platform` | `string` | no |
| `created` | `Date` | no |
| `completed` | `Date` | yes |
| `status` | `GiftcardStatus` | no |
| `paymentType` | `PaymentType` | no |
| `buyerUserId` | `string` | no |
| `buyerPhoneNumber` | `string` | no |
| `buyerMessageToReceiver` | `string` | no |
| `receiverUserId` | `string` | no |
| `receiverPhoneNumber` | `string` | no |
| `storeId` | `number` | no |
| `storeLegalName` | `string` | no |
| `storeVAT` | `number` | no |
| `storeFullAddress` | `string` | no |
| `storeZipCode` | `string` | no |
| `storeCity` | `string` | no |
| `smsCount` | `number` | no |
| `smsFee` | `number` | no |
| `applicationFeeAmount` | `number` | no |
| `applicationFeePercent` | `number` | no |
| `totalFeeAmount` | `number` | no |
| `paymentIntentId` | `string` | no |
| `vippsOrderId` | `string` | no |
| `finalAmount` | `number` | no |
| `giftcardTransactionId` | `string` | yes |
| `giftcardTransaction` | `GiftcardTransaction` | yes |
