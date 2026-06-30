---
type: service
resource: "okam://service/CultureService"
title: "Culture Service"
description: "Shared service `CultureService` — 6 public method(s), 6 HTTP call(s) — from the okam Core library."
domain: culture
authority_tier: source
data_classification: schema-only
source_ref: "services/culture-service.ts:5"
tags:
  - culture
  - service
---

TypeScript service `CultureService` (vendored into okam clients via the Core library).

# Public methods

* `Create(code: string): Promise<Product>`
* `CreateOrUpdateTranslations(cultures: Array<Culture>): Promise<Product>`
* `Delete(code: string): Promise<void>`
* `DeleteTranslation(translationKey: string): Promise<void>`
* `GetAll(): Promise<Array<Culture>>`
* `GetByCode(code: string): Promise<Culture>`

# HTTP calls

| Method | Path |
| --- | --- |
| GET | `/culture` |
| DELETE | `/culture/` |
| GET | `/culture/` |
| POST | `/culture/` |
| POST | `/culture/translation` |
| DELETE | `/culture/translation/` |
