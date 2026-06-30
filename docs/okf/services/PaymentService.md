---
type: service
resource: "okam://service/PaymentService"
title: "Payment Service"
description: "Shared service `PaymentService` — 2 public method(s), 2 HTTP call(s) — from the okam Core library."
domain: payment
authority_tier: source
data_classification: schema-only
source_ref: "services/payment-service.ts:5"
tags:
  - payment
  - service
---

TypeScript service `PaymentService` (vendored into okam clients via the Core library).

# Public methods

* `GetPaymentMethods(cartId?: string, clientSupportsDintero: boolean = false): Promise<PaymentMethod>`
* `GetPaymentMethodsForGiftcard(): Promise<PaymentMethod>`

# HTTP calls

| Method | Path |
| --- | --- |
| POST | `/payment/paymentMethods/` |
| POST | `/payment/paymentMethods/giftcard` |
