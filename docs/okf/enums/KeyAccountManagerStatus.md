---
type: enum
resource: "okam://enum/KeyAccountManagerStatus"
title: "Key Account Manager Status"
description: "Shared enum `KeyAccountManagerStatus` (6 member(s)) from the okam Core library."
domain: key
authority_tier: source
data_classification: schema-only
source_ref: "enums/key-account-manager-status.ts:1"
tags:
  - key
  - enum
---

TypeScript enum `KeyAccountManagerStatus` (vendored into okam clients via the Core library).

# Members

| Member | Value kind |
| --- | --- |
| `MissingSetup` | string |
| `ReadyForDemo` | string |
| `WaitingForCustomerResponse` | string |
| `RequiresFollowUp` | string |
| `InOperation` | string |
| `Deleted` | string |
