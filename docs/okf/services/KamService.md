---
type: service
resource: "okam://service/KamService"
title: "Kam Service"
description: "Shared service `KamService` — 4 public method(s), 4 HTTP call(s) — from the okam Core library."
domain: kam
authority_tier: source
data_classification: schema-only
source_ref: "services/kam-service.ts:5"
tags:
  - kam
  - service
---

TypeScript service `KamService` (vendored into okam clients via the Core library).

# Public methods

* `AssignManager(kamId: string, directorId: string): Promise<boolean>`
* `GetAllKeyAccountManagers(): Promise<KamUserModel[]>`
* `GetKamDirectorRelationships(): Promise<KamDirectorRelationshipModel[]>`
* `UnassignManager(kamId: string): Promise<boolean>`

# HTTP calls

| Method | Path |
| --- | --- |
| GET | `/kam/all` |
| POST | `/kam/assign-manager` |
| GET | `/kam/relationships` |
| POST | `/kam/unassign-manager/${kamId}` |
