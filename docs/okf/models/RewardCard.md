---
type: model
resource: "okam://model/RewardCard"
title: "Reward Card"
description: "Shared class `RewardCard` (5 field(s)) from the okam Core library."
domain: reward
authority_tier: source
data_classification: schema-only
source_ref: "models/reward/reward-card.ts:3"
tags:
  - reward
  - model
  - class
---

TypeScript class `RewardCard` (vendored into okam clients via the Core library).

# Fields

| Field | Type | Optional |
| --- | --- | --- |
| `name` | `string` | no |
| `cashbackPercent` | `number` | no |
| `rewardMembership` | `RewardMembership` | no |
| `balance` | `number` | no |
| `spentAmount` | `number` | no |
