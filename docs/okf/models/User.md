---
type: model
resource: "okam://model/User"
title: "User"
description: "Shared class `User` (21 field(s)) from the okam Core library."
domain: user
authority_tier: source
data_classification: schema-only
source_ref: "models/user/user.ts:3"
tags:
  - user
  - model
  - class
---

TypeScript class `User` (vendored into okam clients via the Core library).

# Fields

| Field | Type | Optional |
| --- | --- | --- |
| `id` | `string` | no |
| `phoneNumber` | `string` | no |
| `email` | `string` | no |
| `emailConfirmed` | `boolean` | no |
| `address` | `Address` | no |
| `token` | `string` | no |
| `favoriteProductIds` | `string[]` | no |
| `firstName` | `string` | no |
| `lastName` | `string` | no |
| `showFeedback` | `boolean` | no |
| `fullAddress` | `string` | no |
| `zipCode` | `string` | no |
| `city` | `string` | no |
| `deliveryInstructions` | `string` | no |
| `companyEmail` | `string` | no |
| `companyName` | `string` | no |
| `companyVat` | `string` | no |
| `companyAddress` | `string` | no |
| `companyZipCode` | `string` | no |
| `companyCity` | `string` | no |
| `isPowerUser` | `boolean` | no |
