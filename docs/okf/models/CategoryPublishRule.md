---
type: model
resource: "okam://model/CategoryPublishRule"
title: "Category Publish Rule"
description: "Shared class `CategoryPublishRule` (4 field(s)) from the okam Core library."
domain: category
authority_tier: source
data_classification: schema-only
source_ref: "models/category/category-publish-rule.ts:2"
tags:
  - category
  - model
  - class
---

TypeScript class `CategoryPublishRule` (vendored into okam clients via the Core library).

# Fields

| Field | Type | Optional |
| --- | --- | --- |
| `id` | `string` | yes |
| `dayOfWeek` | `number` | no |
| `startTimeInMinutes` | `number` | no |
| `endTimeInMinutes` | `number` | no |
