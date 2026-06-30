---
type: model
resource: "okam://model/RewardTransaction"
title: "Reward Transaction"
description: "Shared class `RewardTransaction` (8 field(s)) from the okam Core library."
domain: reward
authority_tier: source
data_classification: schema-only
source_ref: "models/reward/reward-transaction.ts:4"
tags:
  - reward
  - model
  - class
---

TypeScript class `RewardTransaction` (vendored into okam clients via the Core library).

# Fields

| Field | Type | Optional |
| --- | --- | --- |
| `rewardTransactionId` | `string` | no |
| `created` | `Date` | no |
| `amount` | `number` | no |
| `rewardTransactionType` | `RewardTransactionType` | no |
| `rewardMembershipId` | `string` | no |
| `rewardMembership` | `RewardMembership` | no |
| `orderId` | `number \| null` | no |
| `order` | `Order \| null` | no |
