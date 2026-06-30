---
type: service
resource: "okam://service/OfferService"
title: "Offer Service"
description: "Shared service `OfferService` — 4 public method(s), 4 HTTP call(s) — from the okam Core library."
domain: offer
authority_tier: source
data_classification: schema-only
source_ref: "services/offer-service.ts:5"
tags:
  - offer
  - service
---

TypeScript service `OfferService` (vendored into okam clients via the Core library).

# Public methods

* `CreateOrUpdateOffer(model: OfferItemModel): Promise<OfferItemModel>`
* `DeleteOffer(id: string): Promise<boolean>`
* `GetAll(): Promise<OfferItemModel[]>`
* `GetById(id: string): Promise<OfferItemModel>`

# HTTP calls

| Method | Path |
| --- | --- |
| GET | `/offers` |
| POST | `/offers` |
| DELETE | `/offers/${id}` |
| GET | `/offers/${id}` |
