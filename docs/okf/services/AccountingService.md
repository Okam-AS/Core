---
type: service
resource: "okam://service/AccountingService"
title: "Accounting Service"
description: "Shared service `AccountingService` — 2 public method(s), 2 HTTP call(s) — from the okam Core library."
domain: accounting
authority_tier: source
data_classification: schema-only
source_ref: "services/accounting-service.ts:5"
tags:
  - accounting
  - service
---

TypeScript service `AccountingService` (vendored into okam clients via the Core library).

# Public methods

* `GetAccountingConfiguration(storeId: number): Promise<AccountingConfiguration>`
* `UpdateAccountingConfiguration(storeId: number, configuration: AccountingConfiguration): Promise<boolean>`

# HTTP calls

| Method | Path |
| --- | --- |
| GET | `/accounting/store/${storeId}/configuration` |
| PUT | `/accounting/store/${storeId}/configuration` |
