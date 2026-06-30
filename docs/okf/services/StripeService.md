---
type: service
resource: "okam://service/StripeService"
title: "Stripe Service"
description: "Shared service `StripeService` — 3 public method(s), 2 HTTP call(s) — from the okam Core library."
domain: stripe
authority_tier: source
data_classification: schema-only
source_ref: "services/stripe-service.ts:5"
tags:
  - stripe
  - service
---

TypeScript service `StripeService` (vendored into okam clients via the Core library).

# Public methods

* `CreatePaymentIntent(model: StripeCreatePaymentIntent): Promise<any>`
* `CreatePaymentIntentLegacy(amount: number, currency: string, paymentMethodId: string, cartId: string, setupFutureUsage: boolean): Promise<any>`
* `DeletePaymentMethod(paymentMethodId: string): Promise<boolean>`

# HTTP calls

| Method | Path |
| --- | --- |
| POST | `/stripe/createPaymentIntent/` |
| DELETE | `/stripe/paymentMethod/` |
