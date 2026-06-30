---
type: model
resource: "okam://model/UsersGiftcardBalance"
title: "Users Giftcard Balance"
description: "Shared class `UsersGiftcardBalance` (3 field(s)) from the okam Core library."
domain: giftcard
authority_tier: source
data_classification: schema-only
source_ref: "models/giftcard/users-giftcard-balance.ts:3"
tags:
  - giftcard
  - model
  - class
---

TypeScript class `UsersGiftcardBalance` (vendored into okam clients via the Core library).

# Fields

| Field | Type | Optional |
| --- | --- | --- |
| `balance` | `number` | no |
| `hasGiftcard` | `boolean` | no |
| `transactions` | `Array<UsersGiftcardBalanceTransaction>` | no |
