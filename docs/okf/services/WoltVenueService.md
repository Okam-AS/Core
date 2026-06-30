---
type: service
resource: "okam://service/WoltVenueService"
title: "Wolt Venue Service"
description: "Shared service `WoltVenueService` — 5 public method(s), 5 HTTP call(s) — from the okam Core library."
domain: wolt
authority_tier: source
data_classification: schema-only
source_ref: "services/wolt-venue-service.ts:4"
tags:
  - wolt
  - service
---

TypeScript service `WoltVenueService` (vendored into okam clients via the Core library).

# Public methods

* `changeDeliveryProvider(storeId: number, request: any): Promise<boolean>`
* `getCurrentDeliveryProvider(storeId: number): Promise<any>`
* `getVenueStatus(storeId: number): Promise<any>`
* `updateVenueOnlineStatus(storeId: number, request: any): Promise<boolean>`
* `updateVenueOpeningTimes(storeId: number, request: any): Promise<boolean>`

# HTTP calls

| Method | Path |
| --- | --- |
| GET | `/wolt/marketplace/stores/${storeId}/venue/delivery-provider` |
| PATCH | `/wolt/marketplace/stores/${storeId}/venue/delivery-provider` |
| PATCH | `/wolt/marketplace/stores/${storeId}/venue/online` |
| PATCH | `/wolt/marketplace/stores/${storeId}/venue/opening-times` |
| GET | `/wolt/marketplace/stores/${storeId}/venue/status` |
