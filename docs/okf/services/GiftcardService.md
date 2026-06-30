---
type: service
resource: "okam://service/GiftcardService"
title: "Giftcard Service"
description: "Shared service `GiftcardService` — 6 public method(s), 6 HTTP call(s) — from the okam Core library."
domain: giftcard
authority_tier: source
data_classification: schema-only
source_ref: "services/giftcard-service.ts:5"
tags:
  - giftcard
  - service
---

TypeScript service `GiftcardService` (vendored into okam clients via the Core library).

# Public methods

* `CompletePurchase(model: Giftcard): Promise<Boolean>`
* `Get(giftcardId: string): Promise<Giftcard>`
* `GetPurchases(): Promise<Array<Giftcard>>`
* `InitiatePurchase(model: InitiateGiftcardPurchase): Promise<GiftcardPurchaseValidationResponse>`
* `MyBalance(): Promise<UsersGiftcardBalance>`
* `Validate(giftcard: Giftcard)`

# HTTP calls

| Method | Path |
| --- | --- |
| GET | `/giftcard/` |
| POST | `/giftcard/complete-purchase` |
| POST | `/giftcard/initiate-purchase` |
| GET | `/giftcard/mybalance` |
| GET | `/giftcard/purchases` |
| POST | `/giftcard/validate/` |
