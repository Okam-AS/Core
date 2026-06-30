---
type: model
resource: "okam://model/WoltDeliveryInfo"
title: "Wolt Delivery Info"
description: "Shared class `WoltDeliveryInfo` (14 field(s)) from the okam Core library."
domain: order
authority_tier: source
data_classification: schema-only
source_ref: "models/order/wolt-delivery-info.ts:1"
tags:
  - order
  - model
  - class
---

TypeScript class `WoltDeliveryInfo` (vendored into okam clients via the Core library).

# Fields

| Field | Type | Optional |
| --- | --- | --- |
| `woltDeliveryInfoId` | `string` | no |
| `trackingUrl` | `string` | no |
| `woltOrderId` | `string` | no |
| `shipmentPromiseId` | `string` | no |
| `merchantOrderReferenceId` | `string` | no |
| `trackingReference` | `string` | no |
| `woltDriveMerchantKey` | `string` | no |
| `woltDriveMerchantId` | `string` | no |
| `woltDriveVenueId` | `string` | no |
| `status` | `string` | no |
| `pickupEta` | `Date \| null` | no |
| `priceAmount` | `number \| null` | no |
| `priceCurrency` | `string` | no |
| `orderNumber` | `string` | no |
