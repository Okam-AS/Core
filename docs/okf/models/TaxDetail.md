---
type: model
resource: "okam://model/TaxDetail"
title: "Tax Detail"
description: "Shared class `TaxDetail` (4 field(s)) from the okam Core library."
domain: order
authority_tier: source
data_classification: schema-only
source_ref: "models/order/tax-detail.ts:1"
tags:
  - order
  - model
  - class
---

TypeScript class `TaxDetail` (vendored into okam clients via the Core library).

# Fields

| Field | Type | Optional |
| --- | --- | --- |
| `percent` | `number` | no |
| `basis` | `number` | no |
| `amount` | `number` | no |
| `totalAmount` | `number` | no |
