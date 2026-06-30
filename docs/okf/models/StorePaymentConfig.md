---
type: model
resource: "okam://model/StorePaymentConfig"
title: "Store Payment Config"
description: "Shared class `StorePaymentConfig` (10 field(s)) from the okam Core library."
domain: store
authority_tier: source
data_classification: schema-only
source_ref: "models/store/store-payment-config.ts:1"
tags:
  - store
  - model
  - class
---

TypeScript class `StorePaymentConfig` (vendored into okam clients via the Core library).

# Fields

| Field | Type | Optional |
| --- | --- | --- |
| `payInStoreAvailable` | `boolean` | no |
| `stripeAvailable` | `boolean` | no |
| `vippsAvailable` | `boolean` | no |
| `giftcardAvailable` | `boolean` | no |
| `dinteroAvailable` | `boolean` | no |
| `dinteroPrice` | `number` | no |
| `dinteroBillieAvailable` | `boolean` | no |
| `dinteroKlarnaAvailable` | `boolean` | no |
| `dinteroBilliePrice` | `string` | no |
| `dinteroKlarnaPrice` | `string` | no |
