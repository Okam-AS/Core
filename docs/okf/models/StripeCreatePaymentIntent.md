---
type: model
resource: "okam://model/StripeCreatePaymentIntent"
title: "Stripe Create Payment Intent"
description: "Shared class `StripeCreatePaymentIntent` (7 field(s)) from the okam Core library."
domain: payment
authority_tier: source
data_classification: schema-only
source_ref: "models/payment/stripe-create-payment-intent.ts:1"
tags:
  - payment
  - model
  - class
---

TypeScript class `StripeCreatePaymentIntent` (vendored into okam clients via the Core library).

# Fields

| Field | Type | Optional |
| --- | --- | --- |
| `cartId` | `string` | yes |
| `giftcardId` | `string` | yes |
| `amount` | `number` | no |
| `paymentMethodId` | `string` | no |
| `setupFutureUsage` | `boolean` | no |
| `currency` | `string` | no |
| `clientMajorVersion` | `number` | no |
