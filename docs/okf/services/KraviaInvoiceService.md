---
type: service
resource: "okam://service/KraviaInvoiceService"
title: "Kravia Invoice Service"
description: "Shared service `KraviaInvoiceService` — 3 public method(s), 3 HTTP call(s) — from the okam Core library."
domain: kravia
authority_tier: source
data_classification: schema-only
source_ref: "services/kravia-invoice-service.ts:4"
tags:
  - kravia
  - service
---

TypeScript service `KraviaInvoiceService` (vendored into okam clients via the Core library).

# Public methods

* `GetCompany(orgNo: string): Promise<any>`
* `GetCompanyHistory(storeId: number): Promise<any[]>`
* `SendInvoice(payload: any): Promise<any>`

# HTTP calls

| Method | Path |
| --- | --- |
| GET | `/admin-kravia-invoices/company/` |
| POST | `/admin-kravia-invoices/send` |
| GET | `/admin-kravia-invoices/stores/` |
