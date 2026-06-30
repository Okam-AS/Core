---
type: model
resource: "okam://model/RewardMembership"
title: "Reward Membership"
description: "Shared class `RewardMembership` (13 field(s)) from the okam Core library."
domain: reward
authority_tier: source
data_classification: schema-only
source_ref: "models/reward/reward-membership.ts:3"
tags:
  - reward
  - model
  - class
---

TypeScript class `RewardMembership` (vendored into okam clients via the Core library).

# Fields

| Field | Type | Optional |
| --- | --- | --- |
| `rewardMembershipId` | `string` | no |
| `rewardProgramId` | `string \| null` | no |
| `rewardProgram` | `RewardProgram \| null` | no |
| `userId` | `string` | no |
| `user` | `User` | no |
| `acceptedOffersNotifications` | `Date \| null` | no |
| `acceptedOffersNotificationsValue` | `boolean \| null` | no |
| `acceptedNewsNotifications` | `Date \| null` | no |
| `acceptedNewsNotificationsValue` | `boolean \| null` | no |
| `acceptedRewardsTerms` | `Date \| null` | no |
| `acceptedRewardsTermsValue` | `boolean \| null` | no |
| `rewardTransactions` | `RewardTransaction[]` | no |
| `collectRewards` | `boolean` | no |
