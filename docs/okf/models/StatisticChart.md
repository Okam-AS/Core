---
type: model
resource: "okam://model/StatisticChart"
title: "Statistic Chart"
description: "Shared class `StatisticChart` (5 field(s)) from the okam Core library."
domain: statistic
authority_tier: source
data_classification: schema-only
source_ref: "models/statistic/statistic-chart.ts:3"
tags:
  - statistic
  - model
  - class
---

TypeScript class `StatisticChart` (vendored into okam clients via the Core library).

# Fields

| Field | Type | Optional |
| --- | --- | --- |
| `headingKey` | `string` | no |
| `headingValue` | `number` | no |
| `headingValueIsPrice` | `boolean` | no |
| `points` | `Array<StatisticKeyValueData>` | no |
| `xAxisLabel` | `string` | no |
