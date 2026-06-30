---
type: service
resource: "okam://service/DinteroService"
title: "Dintero Service"
description: "Shared service `DinteroService` — 6 public method(s), 5 HTTP call(s) — from the okam Core library."
domain: dintero
authority_tier: source
data_classification: schema-only
source_ref: "services/dintero-service.ts:5"
tags:
  - dintero
  - service
---

TypeScript service `DinteroService` (vendored into okam clients via the Core library).

# Public methods

* `createSeller(payload: any): Promise<any>`
* `deleteSeller(id: number, forceDelete: boolean): Promise<boolean>`
* `getSellers(): Promise<any[]>`
* `Initiate(model: DinteroInitiatePaymentModel): Promise<DinteroInitResponse>`
* `PullVerifyResult(sessionId, successHandler, failHandler)`
* `Verify(sessionId: string): Promise<DinteroVerifyResponse>`

# HTTP calls

| Method | Path |
| --- | --- |
| POST | `/dintero/initiate` |
| GET | `/dintero/sellers` |
| POST | `/dintero/sellers` |
| DELETE | `/dintero/sellers/` |
| GET | `/dintero/verify/` |
