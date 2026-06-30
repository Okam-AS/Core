---
type: model
resource: "okam://model/RewardProgram"
title: "Reward Program"
description: "Shared class `RewardProgram` (13 field(s)) from the okam Core library."
domain: reward
authority_tier: source
data_classification: schema-only
source_ref: "models/reward/reward-program.ts:3"
tags:
  - reward
  - model
  - class
---

TypeScript class `RewardProgram` (vendored into okam clients via the Core library).

# Fields

| Field | Type | Optional |
| --- | --- | --- |
| `rewardProgramId` | `string` | no |
| `name` | `string` | no |
| `cashbackEnabled` | `boolean` | no |
| `cutOffDaysForRewardCalculation` | `number` | no |
| `cashbackRanges` | `Array<RewardCachbackRange>` | no |
| `cashbackRangeToString` | `string` | no |
| `stores` | `Array<Store>` | no |
| `memberships` | `Array<RewardMembership>` | no |
| `rewardBarData` | `Array<RewardBarData>` | no |
| `averageOrderCountForNonMembers` | `number` | no |
| `averageOrderCountForMembers` | `number` | no |
| `averageSpentForNonMembers` | `number` | no |
| `averageSpentForMembers` | `number` | no |
