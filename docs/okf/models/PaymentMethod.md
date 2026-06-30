---
type: model
resource: "okam://model/PaymentMethod"
title: "Payment Method"
description: "Shared class `PaymentMethod` (6 field(s)) from the okam Core library."
domain: payment
authority_tier: source
data_classification: schema-only
source_ref: "models/payment/payment-method.ts:3"
tags:
  - payment
  - model
  - class
---

TypeScript class `PaymentMethod` (vendored into okam clients via the Core library).

# Fields

| Field | Type | Optional |
| --- | --- | --- |
| `id` | `string` | no |
| `last4` | `string` | no |
| `expMonth` | `string` | no |
| `expYear` | `string` | no |
| `brand` | `string` | no |
| `paymentType` | `PaymentType` | no |
