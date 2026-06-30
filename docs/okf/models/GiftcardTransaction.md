---
type: model
resource: "okam://model/GiftcardTransaction"
title: "Giftcard Transaction"
description: "Shared class `GiftcardTransaction` (8 field(s)) from the okam Core library."
domain: giftcard
authority_tier: source
data_classification: schema-only
source_ref: "models/giftcard/giftcard-transaction.ts:4"
tags:
  - giftcard
  - model
  - class
---

TypeScript class `GiftcardTransaction` (vendored into okam clients via the Core library).

# Fields

| Field | Type | Optional |
| --- | --- | --- |
| `giftcardTransactionId` | `string` | no |
| `created` | `Date` | no |
| `amount` | `number` | no |
| `type` | `GiftcardTransactionType` | no |
| `giftcardId` | `string` | no |
| `giftcard` | `Giftcard` | no |
| `orderId` | `number \| null` | no |
| `order` | `Order \| null` | no |
