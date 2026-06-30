---
type: model
resource: "okam://model/GiftcardPurchaseValidationResponse"
title: "Giftcard Purchase Validation Response"
description: "Shared class `GiftcardPurchaseValidationResponse` (10 field(s)) from the okam Core library."
domain: giftcard
authority_tier: source
data_classification: schema-only
source_ref: "models/giftcard/giftcard-purchase-validation-response.ts:1"
tags:
  - giftcard
  - model
  - class
---

TypeScript class `GiftcardPurchaseValidationResponse` (vendored into okam clients via the Core library).

# Fields

| Field | Type | Optional |
| --- | --- | --- |
| `giftcardId` | `string` | no |
| `storeNotFound` | `boolean` | no |
| `giftcardNotFound` | `boolean` | no |
| `amountError` | `boolean` | no |
| `userNotBuyer` | `boolean` | no |
| `paymentTypeError` | `boolean` | no |
| `alreadyCompleted` | `boolean` | no |
| `receiverPhoneNumberNotValid` | `boolean` | no |
| `receiverPhoneNumberNotAUser` | `boolean` | no |
| `hasErrors` | `boolean` | no |
