---
type: model
resource: "okam://model/DineHomeDeliveryTimesResponse"
title: "Dine Home Delivery Times Response"
description: "Shared class `DineHomeDeliveryTimesResponse` (7 field(s)) from the okam Core library."
domain: dinehome
authority_tier: source
data_classification: schema-only
source_ref: "models/dinehome/dinehome-delivery-times-response.ts:1"
tags:
  - dinehome
  - model
  - class
---

TypeScript class `DineHomeDeliveryTimesResponse` (vendored into okam clients via the Core library).

# Fields

| Field | Type | Optional |
| --- | --- | --- |
| `storeName` | `string` | no |
| `dineHomeOrderId` | `number` | no |
| `friendlyOrderId` | `string` | no |
| `estimatedProcessingEndTime` | `Date` | no |
| `processingEndTime` | `Date` | no |
| `completedTime` | `Date` | no |
| `drivingTimeInMinutes` | `number` | no |
