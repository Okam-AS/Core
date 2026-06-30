---
type: model
resource: "okam://model/Payout"
title: "Payout"
description: "Shared class `Payout` (14 field(s)) from the okam Core library."
domain: payout
authority_tier: source
data_classification: schema-only
source_ref: "models/payout/payout.ts:1"
tags:
  - payout
  - model
  - class
---

TypeScript class `Payout` (vendored into okam clients via the Core library).

# Fields

| Field | Type | Optional |
| --- | --- | --- |
| `okamPayoutId` | `number` | no |
| `requested` | `Date \| null` | no |
| `payed` | `Date \| null` | no |
| `payoutAmount` | `number` | no |
| `numberOfOrders` | `number` | no |
| `invoiceFee` | `number` | no |
| `commission` | `number` | no |
| `previousPayout` | `Date \| null` | no |
| `storeId` | `number` | no |
| `store` | `any` | no |
| `invoiceSent` | `boolean` | no |
| `invoiceId` | `number \| null` | no |
| `invoice` | `any` | no |
| `storeBankAccountNumber` | `string` | no |
