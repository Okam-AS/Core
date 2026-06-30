---
type: service
resource: "okam://service/DineHomeService"
title: "Dine Home Service"
description: "Shared service `DineHomeService` — 1 public method(s), 1 HTTP call(s) — from the okam Core library."
domain: dinehome
authority_tier: source
data_classification: schema-only
source_ref: "services/dinehome-service.ts:5"
tags:
  - dinehome
  - service
---

TypeScript service `DineHomeService` (vendored into okam clients via the Core library).

# Public methods

* `getDeliveryTimes(request: DineHomeDeliveryTimesRequest): Promise<DineHomeDeliveryTimesResponse[]>`

# HTTP calls

| Method | Path |
| --- | --- |
| POST | `/dinehome/delivery-times` |
