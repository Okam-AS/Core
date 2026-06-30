---
type: model
resource: "okam://model/Config"
title: "Config"
description: "Shared class `Config` (4 field(s)) from the okam Core library."
domain: config
authority_tier: source
data_classification: schema-only
source_ref: "models/config/config.ts:1"
tags:
  - config
  - model
  - class
---

TypeScript class `Config` (vendored into okam clients via the Core library).

# Fields

| Field | Type | Optional |
| --- | --- | --- |
| `okamStoreId` | `number` | no |
| `cashbackEnabled` | `boolean` | no |
| `giftcardEnabled` | `boolean` | no |
| `kams` | `Array<{ id: string }>` | no |
