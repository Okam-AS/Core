---
type: service
resource: "okam://service/LogService"
title: "Log Service"
description: "Shared service `LogService` — 1 public method(s), 1 HTTP call(s) — from the okam Core library."
domain: log
authority_tier: source
data_classification: schema-only
source_ref: "services/log-service.ts:5"
tags:
  - log
  - service
---

TypeScript service `LogService` (vendored into okam clients via the Core library).

# Public methods

* `Create(log: EventLog): Promise<boolean>`

# HTTP calls

| Method | Path |
| --- | --- |
| POST | `/eventlogs` |
