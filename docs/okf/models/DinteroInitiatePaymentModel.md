---
type: model
resource: "okam://model/DinteroInitiatePaymentModel"
title: "Dintero Initiate Payment Model"
description: "Shared class `DinteroInitiatePaymentModel` (9 field(s)) from the okam Core library."
domain: dintero
authority_tier: source
data_classification: schema-only
source_ref: "models/dintero/dintero-initiate-payment-model.ts:3"
tags:
  - dintero
  - model
  - class
---

TypeScript class `DinteroInitiatePaymentModel` (vendored into okam clients via the Core library).

# Fields

| Field | Type | Optional |
| --- | --- | --- |
| `isApp` | `boolean` | no |
| `useAppSwitch` | `boolean` | no |
| `storeId` | `number` | no |
| `paymentType` | `PaymentType` | no |
| `amount` | `number` | no |
| `merchantReference` | `string` | yes |
| `customerReference` | `string` | yes |
| `cartId` | `string` | yes |
| `giftcardId` | `string` | yes |
