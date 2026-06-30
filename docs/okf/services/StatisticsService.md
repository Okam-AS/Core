---
type: service
resource: "okam://service/StatisticsService"
title: "Statistics Service"
description: "Shared service `StatisticsService` — 5 public method(s), 5 HTTP call(s) — from the okam Core library."
domain: statistic
authority_tier: source
data_classification: schema-only
source_ref: "services/statistics-service.ts:5"
tags:
  - statistic
  - service
---

TypeScript service `StatisticsService` (vendored into okam clients via the Core library).

# Public methods

* `Get(model: StatisticQueryOrders): Promise<StatisticOrders>`
* `GetHeatmapData(model: StatisticQueryOrders): Promise<any>`
* `GetPendingSettlements(model: { StoreId: number, from: string, to: string }): Promise<any>`
* `GetPlatformGrowth(): Promise<any>`
* `GetWoltDriveInvoice(model: { StoreId: number, From: string, To: string, AvgMetersPerDelivery: number }): Promise<any>`

# HTTP calls

| Method | Path |
| --- | --- |
| POST | `/statistics` |
| POST | `/statistics/heatmap` |
| POST | `/statistics/pending-settlements` |
| GET | `/statistics/platform-growth` |
| POST | `/statistics/wolt-drive-invoice` |
