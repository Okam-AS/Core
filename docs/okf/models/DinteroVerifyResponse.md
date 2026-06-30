---
type: model
resource: "okam://model/DinteroVerifyResponse"
title: "Dintero Verify Response"
description: "Shared class `DinteroVerifyResponse` (4 field(s)) from the okam Core library."
domain: payment
authority_tier: source
data_classification: schema-only
source_ref: "models/payment/dintero-verify-response.ts:3"
tags:
  - payment
  - model
  - class
---

TypeScript class `DinteroVerifyResponse` (vendored into okam clients via the Core library).

# Fields

| Field | Type | Optional |
| --- | --- | --- |
| `storeId` | `number` | no |
| `orderId` | `string` | no |
| `giftcardId` | `string` | yes |
| `status` | `DinteroVerifyStatus` | no |
