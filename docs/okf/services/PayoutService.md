---
type: service
resource: "okam://service/PayoutService"
title: "Payout Service"
description: "Shared service `PayoutService` — 6 public method(s), 6 HTTP call(s) — from the okam Core library."
domain: payout
authority_tier: source
data_classification: schema-only
source_ref: "services/payout-service.ts:5"
tags:
  - payout
  - service
---

TypeScript service `PayoutService` (vendored into okam clients via the Core library).

# Public methods

* `CancelRequestPayout(storeId: number)`
* `CompletePayout(storeId: number)`
* `GetAwaiting(storeId: number): Promise<Payout>`
* `GetLatest(): Promise<Payout[]>`
* `RequestPayout(storeId: number)`
* `SendInvoiceMail(okamPayoutId: number)`

# HTTP calls

| Method | Path |
| --- | --- |
| GET | `/payouts/awaiting/` |
| POST | `/payouts/complete/` |
| GET | `/payouts/latest` |
| DELETE | `/payouts/request/` |
| POST | `/payouts/request/` |
| POST | `/payouts/send-mail/` |
