---
type: service
resource: "okam://service/BankAccountService"
title: "Bank Account Service"
description: "Shared service `BankAccountService` — 5 public method(s), 5 HTTP call(s) — from the okam Core library."
domain: bankaccount
authority_tier: source
data_classification: schema-only
source_ref: "services/bank-account-service.ts:5"
tags:
  - bankaccount
  - service
---

TypeScript service `BankAccountService` (vendored into okam clients via the Core library).

# Public methods

* `Create(storeid: number): Promise<BankAccount>`
* `Delete(accountId: string): Promise<boolean>`
* `Get(accountId: string): Promise<BankAccount>`
* `Login(accountId: string): Promise<any>`
* `Onboard(accountId: string): Promise<any>`

# HTTP calls

| Method | Path |
| --- | --- |
| DELETE | `/bankaccount/` |
| GET | `/bankaccount/` |
| POST | `/bankaccount/create/` |
| GET | `/bankaccount/login/` |
| GET | `/bankaccount/onboarding/` |
