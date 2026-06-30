---
type: model
resource: "okam://model/ApplicationUser"
title: "Application User"
description: "Shared class `ApplicationUser` (17 field(s)) from the okam Core library."
domain: user
authority_tier: source
data_classification: schema-only
source_ref: "models/user/application-user.ts:1"
tags:
  - user
  - model
  - class
---

TypeScript class `ApplicationUser` (vendored into okam clients via the Core library).

# Fields

| Field | Type | Optional |
| --- | --- | --- |
| `id` | `string` | no |
| `phoneNumber` | `string` | no |
| `registered` | `Date` | yes |
| `confirmed` | `Date` | yes |
| `stripeCustomerId` | `string` | yes |
| `fullAddress` | `string` | yes |
| `zipCode` | `string` | yes |
| `city` | `string` | yes |
| `firstName` | `string` | yes |
| `lastName` | `string` | yes |
| `birthDate` | `Date` | yes |
| `showFeedback` | `boolean` | no |
| `favoriteProductIds` | `string[]` | no |
| `adminIn` | `any[]` | no |
| `token` | `string` | no |
| `email` | `string` | yes |
| `emailConfirmed` | `boolean` | no |
