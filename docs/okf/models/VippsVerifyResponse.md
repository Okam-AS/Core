---
type: model
resource: "okam://model/VippsVerifyResponse"
title: "Vipps Verify Response"
description: "Shared class `VippsVerifyResponse` (3 field(s)) from the okam Core library."
domain: payment
authority_tier: source
data_classification: schema-only
source_ref: "models/payment/vipps-verify-response.ts:3"
tags:
  - payment
  - model
  - class
---

TypeScript class `VippsVerifyResponse` (vendored into okam clients via the Core library).

# Fields

| Field | Type | Optional |
| --- | --- | --- |
| `storeId` | `number` | no |
| `orderId` | `string` | no |
| `status` | `VippsVerifyStatus` | no |
