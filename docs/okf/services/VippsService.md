---
type: service
resource: "okam://service/VippsService"
title: "Vipps Service"
description: "Shared service `VippsService` — 2 public method(s), 2 HTTP call(s) — from the okam Core library."
domain: vipps
authority_tier: source
data_classification: schema-only
source_ref: "services/vipps-service.ts:5"
tags:
  - vipps
  - service
---

TypeScript service `VippsService` (vendored into okam clients via the Core library).

# Public methods

* `Initiate(cartId: string, giftcardId: string, amount: number, isApp: boolean): Promise<VippsInitiateResponse>`
* `Verify(orderId: string): Promise<VippsVerifyResponse>`

# HTTP calls

| Method | Path |
| --- | --- |
| POST | `/vipps/initiate/` |
| GET | `/vipps/verify/` |
