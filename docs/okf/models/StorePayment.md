---
type: model
resource: "okam://model/StorePayment"
title: "Store Payment"
description: "Shared class `StorePayment` (11 field(s)) from the okam Core library."
domain: store
authority_tier: source
data_classification: schema-only
source_ref: "models/store/store-payment.ts:1"
tags:
  - store
  - model
  - class
---

TypeScript class `StorePayment` (vendored into okam clients via the Core library).

# Fields

| Field | Type | Optional |
| --- | --- | --- |
| `payInStoreEnabled` | `boolean` | yes |
| `stripeEnabled` | `boolean` | yes |
| `stripeBankAccountId` | `string` | no |
| `vippsEnabled` | `boolean` | yes |
| `vippsMsn` | `string` | no |
| `giftcardEnabled` | `boolean` | yes |
| `giftcardBankAccountNumber` | `string` | no |
| `sendInvoiceToEmails` | `string` | no |
| `dinteroEnabled` | `boolean` | yes |
| `dinteroBillieEnabled` | `boolean` | yes |
| `dinteroKlarnaEnabled` | `boolean` | yes |
