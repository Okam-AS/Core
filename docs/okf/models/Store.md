---
type: model
resource: "okam://model/Store"
title: "Store"
description: "Shared class `Store` (12 field(s)) from the okam Core library."
domain: store
authority_tier: source
data_classification: schema-only
source_ref: "models/store/store.ts:2"
tags:
  - store
  - model
  - class
---

TypeScript class `Store` (vendored into okam clients via the Core library).

# Fields

| Field | Type | Optional |
| --- | --- | --- |
| `id` | `number` | no |
| `name` | `string` | no |
| `slug` | `string` | no |
| `termsUrl` | `string` | no |
| `legalName` | `string` | no |
| `phoneNumber` | `string` | no |
| `logoUrl` | `string` | no |
| `feedbackUrl` | `string` | no |
| `feedbackMessage` | `string` | no |
| `address` | `Address` | no |
| `homeDeliveryFromAddress` | `Address` | no |
| `categories` | `Array<Category>` | no |
