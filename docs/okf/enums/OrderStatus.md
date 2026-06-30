---
type: enum
resource: "okam://enum/OrderStatus"
title: "Order Status"
description: "Shared enum `OrderStatus` (8 member(s)) from the okam Core library."
domain: order
authority_tier: source
data_classification: schema-only
source_ref: "enums/order-status.ts:1"
tags:
  - order
  - enum
---

TypeScript enum `OrderStatus` (vendored into okam clients via the Core library).

# Members

| Member | Value kind |
| --- | --- |
| `Accepted` | string |
| `Processing` | string |
| `ReadyForPickup` | string |
| `ReadyForDriver` | string |
| `DriverPickedUp` | string |
| `Served` | string |
| `Completed` | string |
| `Canceled` | string |
