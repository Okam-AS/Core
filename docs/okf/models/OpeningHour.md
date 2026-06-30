---
type: model
resource: "okam://model/OpeningHour"
title: "Opening Hour"
description: "Shared class `OpeningHour` (4 field(s)) from the okam Core library."
domain: store
authority_tier: source
data_classification: schema-only
source_ref: "models/store/opening-hour.ts:1"
tags:
  - store
  - model
  - class
---

TypeScript class `OpeningHour` (vendored into okam clients via the Core library).

# Fields

| Field | Type | Optional |
| --- | --- | --- |
| `dayOfWeek` | `number` | no |
| `openingTime` | `string` | no |
| `closingTime` | `string` | no |
| `open` | `boolean` | no |
