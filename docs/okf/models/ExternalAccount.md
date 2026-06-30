---
type: model
resource: "okam://model/ExternalAccount"
title: "External Account"
description: "Shared class `ExternalAccount` (3 field(s)) from the okam Core library."
domain: bankaccount
authority_tier: source
data_classification: schema-only
source_ref: "models/bankaccount/external-account.ts:2"
tags:
  - bankaccount
  - model
  - class
---

TypeScript class `ExternalAccount` (vendored into okam clients via the Core library).

# Fields

| Field | Type | Optional |
| --- | --- | --- |
| `data` | `Array<ExternalAccountData>` | no |
| `has_more` | `boolean` | no |
| `url` | `string` | no |
