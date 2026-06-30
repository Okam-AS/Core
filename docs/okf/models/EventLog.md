---
type: model
resource: "okam://model/EventLog"
title: "Event Log"
description: "Shared class `EventLog` (14 field(s)) from the okam Core library."
domain: log
authority_tier: source
data_classification: schema-only
source_ref: "models/log/event-log.ts:2"
tags:
  - log
  - model
  - class
---

TypeScript class `EventLog` (vendored into okam clients via the Core library).

# Fields

| Field | Type | Optional |
| --- | --- | --- |
| `eventName` | `string` | no |
| `eventValue` | `string` | no |
| `timeStamp` | `Date` | no |
| `launchId` | `string` | no |
| `resumeId` | `string` | no |
| `deviceMake` | `string` | no |
| `deviceModel` | `string` | no |
| `pageName` | `string` | no |
| `modalName` | `string` | no |
| `os` | `string` | no |
| `osVersion` | `string` | no |
| `appName` | `string` | no |
| `appVersion` | `string` | no |
| `stackTrace` | `string` | no |
