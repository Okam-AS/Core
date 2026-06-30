---
type: model
resource: "okam://model/InitiateGiftcardPurchase"
title: "Initiate Giftcard Purchase"
description: "Shared class `InitiateGiftcardPurchase` (4 field(s)) from the okam Core library."
domain: giftcard
authority_tier: source
data_classification: schema-only
source_ref: "models/giftcard/initiate-giftcard-purchase.ts:3"
tags:
  - giftcard
  - model
  - class
---

TypeScript class `InitiateGiftcardPurchase` (vendored into okam clients via the Core library).

# Fields

| Field | Type | Optional |
| --- | --- | --- |
| `paymentType` | `PaymentType` | no |
| `buyerMessageToReceiver` | `string` | no |
| `receiverPhoneNumber` | `string` | no |
| `finalAmount` | `number` | no |
