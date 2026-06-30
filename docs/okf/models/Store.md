---
type: model
resource: "okam://model/Store"
title: "Store"
description: "Shared class `Store` (39 field(s)) from the okam Core library."
domain: store
authority_tier: source
data_classification: schema-only
source_ref: "models/store/store.ts:2"
tags:
  - store
  - model
  - class
---

TypeScript class `Store` (vendored into okam clients via the Core library).

# Fields

| Field | Type | Optional |
| --- | --- | --- |
| `id` | `number` | no |
| `name` | `string` | no |
| `slug` | `string` | no |
| `termsUrl` | `string` | no |
| `legalName` | `string` | no |
| `phoneNumber` | `string` | no |
| `logoUrl` | `string` | no |
| `feedbackUrl` | `string` | no |
| `feedbackMessage` | `string` | no |
| `address` | `Address` | no |
| `homeDeliveryFromAddress` | `Address` | no |
| `categories` | `Array<Category>` | no |
| `allowOrdersAfterOpeningHours` | `boolean` | no |
| `openingHours` | `Array<OpeningHour>` | no |
| `isOpenNow` | `boolean` | no |
| `vat` | `number` | no |
| `admins` | `Array<User>` | no |
| `editors` | `Array<User>` | no |
| `homeDeliveryMethods` | `Array<DeliveryMethod>` | no |
| `approved` | `boolean` | no |
| `selfCheckout` | `boolean` | no |
| `registered` | `Date` | no |
| `bankAccountId` | `string` | no |
| `vippsMsn` | `string` | no |
| `minimumOrderPriceForHomeDelivery` | `number` | no |
| `dineHomeOutletId` | `string` | no |
| `rewardProgramId` | `string` | no |
| `rewardProgram` | `RewardProgram` | no |
| `warningMessage` | `string` | no |
| `statusMessage` | `string` | no |
| `selfPickUp` | `boolean` | no |
| `tableDeliveryEnabled` | `boolean` | no |
| `homeDeliveryEnabled` | `boolean` | no |
| `dineHomeDeliveryEnabled` | `boolean` | no |
| `woltDriveEnabled` | `boolean` | no |
| `woltDriveIsConfigured` | `boolean` | no |
| `payment` | `StorePayment` | no |
| `tip` | `StoreTip` | no |
| `dinteroStoreConfiguration` | `DinteroStoreConfiguration` | no |
