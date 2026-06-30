---
type: model
resource: "okam://model/BulkImport"
title: "Bulk Import"
description: "Shared class `BulkImport` (5 field(s)) from the okam Core library."
domain: product
authority_tier: source
data_classification: schema-only
source_ref: "models/product/bulk-import.ts:2"
tags:
  - product
  - model
  - class
---

TypeScript class `BulkImport` (vendored into okam clients via the Core library).

# Fields

| Field | Type | Optional |
| --- | --- | --- |
| `storeId` | `number` | no |
| `currency` | `string` | no |
| `ReplaceAll` | `boolean` | no |
| `VerifyOnly` | `boolean` | no |
| `rows` | `Array<BulkImportRow>` | no |
