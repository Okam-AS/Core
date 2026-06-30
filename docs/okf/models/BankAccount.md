---
type: model
resource: "okam://model/BankAccount"
title: "Bank Account"
description: "Shared class `BankAccount` (5 field(s)) from the okam Core library."
domain: bankaccount
authority_tier: source
data_classification: schema-only
source_ref: "models/bankaccount/bank-account.ts:5"
tags:
  - bankaccount
  - model
  - class
---

TypeScript class `BankAccount` (vendored into okam clients via the Core library).

# Fields

| Field | Type | Optional |
| --- | --- | --- |
| `id` | `string` | no |
| `business_type` | `string` | no |
| `email` | `string` | no |
| `external_accounts` | `ExternalAccount` | no |
| `requirements` | `BankAccountRequirements` | no |
