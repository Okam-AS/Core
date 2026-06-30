---
type: service
resource: "okam://service/ConfigService"
title: "Config Service"
description: "Shared service `ConfigService` — 2 public method(s), 1 HTTP call(s) — from the okam Core library."
domain: config
authority_tier: source
data_classification: schema-only
source_ref: "services/config-service.ts:5"
tags:
  - config
  - service
---

TypeScript service `ConfigService` (vendored into okam clients via the Core library).

# Public methods

* `Get(): Promise<Config>`
* `Reload(): Promise<Config>`

# HTTP calls

| Method | Path |
| --- | --- |
| GET | `/config` |
