---
type: model
resource: "okam://model/UsersGiftcardBalanceTransaction"
title: "Users Giftcard Balance Transaction"
description: "Shared class `UsersGiftcardBalanceTransaction` (6 field(s)) from the okam Core library."
domain: giftcard
authority_tier: source
data_classification: schema-only
source_ref: "models/giftcard/users-giftcard-balance-transaction.ts:3"
tags:
  - giftcard
  - model
  - class
---

TypeScript class `UsersGiftcardBalanceTransaction` (vendored into okam clients via the Core library).

# Fields

| Field | Type | Optional |
| --- | --- | --- |
| `title` | `string` | no |
| `created` | `Date` | no |
| `amount` | `number` | no |
| `type` | `GiftcardTransactionType` | no |
| `buyerPhoneNumber` | `string` | no |
| `buyerMessageToReceiver` | `string` | no |
