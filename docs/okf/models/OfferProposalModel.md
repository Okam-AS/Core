---
type: model
resource: "okam://model/OfferProposalModel"
title: "Offer Proposal Model"
description: "Shared class `OfferProposalModel` (25 field(s)) from the okam Core library."
domain: offer
authority_tier: source
data_classification: schema-only
source_ref: "models/offer/offer-proposal-model.ts:4"
tags:
  - offer
  - model
  - class
---

TypeScript class `OfferProposalModel` (vendored into okam clients via the Core library).

# Fields

| Field | Type | Optional |
| --- | --- | --- |
| `offerProposalId` | `number` | no |
| `code` | `string` | no |
| `clientName` | `string` | no |
| `clientEmail` | `string` | no |
| `clientPhoneNumber` | `string` | no |
| `companyLegalName` | `string` | no |
| `companyFullAddress` | `string` | no |
| `companyZipCode` | `string` | no |
| `companyCity` | `string` | no |
| `companyVAT` | `string` | no |
| `createdAt` | `Date` | no |
| `createdBy` | `string` | no |
| `updatedAt` | `Date` | yes |
| `updatedBy` | `string` | yes |
| `accepted` | `Date` | yes |
| `expiration` | `Date` | yes |
| `status` | `OfferProposalStatus` | no |
| `notes` | `string` | no |
| `internalNotes` | `string` | no |
| `sellerId` | `string` | yes |
| `sellerName` | `string` | yes |
| `sellersManagerId` | `string` | yes |
| `sellersManagerName` | `string` | yes |
| `isExpired` | `boolean` | no |
| `lineItems` | `OfferProposalLineItemModel[]` | no |
