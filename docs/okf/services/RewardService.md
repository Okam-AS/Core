---
type: service
resource: "okam://service/RewardService"
title: "Reward Service"
description: "Shared service `RewardService` — 12 public method(s), 7 HTTP call(s) — from the okam Core library."
domain: reward
authority_tier: source
data_classification: schema-only
source_ref: "services/reward-service.ts:5"
tags:
  - reward
  - service
---

TypeScript service `RewardService` (vendored into okam clients via the Core library).

# Public methods

* `CancelMembership(rewardProgramId: string): Promise<Boolean>`
* `Get(storeId: number)`
* `GetDetailed(rewardProgramId: string): Promise<RewardProgram>`
* `GetMembers(storeId: number)`
* `GetRewardCards(storeId: number, userId: number)`
* `GetStats(storeId: number)`
* `Init(storeId: number)`
* `Join(model: RewardJoinProgram): Promise<Boolean>`
* `Link(storeId: number, rewardProgramId: string)`
* `Remove(storeId: number): Promise<boolean>`
* `SendReward(storeId: number, userId: number, amount: number)`
* `Update(storeId: number, model: RewardProgram): Promise<boolean>`

# HTTP calls

| Method | Path |
| --- | --- |
| DELETE | `/rewards/` |
| GET | `/rewards/` |
| POST | `/rewards/` |
| PUT | `/rewards/` |
| POST | `/rewards/join` |
| GET | `/rewards/members/` |
| POST | `/rewards/send` |
