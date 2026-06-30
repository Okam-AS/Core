---
type: service
resource: "okam://service/DeliveryMethodService"
title: "Delivery Method Service"
description: "Shared service `DeliveryMethodService` — 5 public method(s), 5 HTTP call(s) — from the okam Core library."
domain: delivery
authority_tier: source
data_classification: schema-only
source_ref: "services/delivery-method-service.ts:5"
tags:
  - delivery
  - service
---

TypeScript service `DeliveryMethodService` (vendored into okam clients via the Core library).

# Public methods

* `Create(deliveryMethod: DeliveryMethod): Promise<DeliveryMethod>`
* `Delete(id: string): Promise<void>`
* `Get(storeId: number): Promise<Array<DeliveryMethod>>`
* `GetHomeDeliveryMethod(storeId: number, from: string, to: string): Promise<DeliveryMethod>`
* `Update(deliveryMethod: DeliveryMethod): Promise<DeliveryMethod>`

# HTTP calls

| Method | Path |
| --- | --- |
| POST | `/deliverymethods` |
| PUT | `/deliverymethods` |
| DELETE | `/deliverymethods/` |
| GET | `/deliverymethods/` |
| POST | `/deliverymethods/homedeliverymethod` |
