---
type: model
resource: "okam://model/OfferProposalLineItemModel"
title: "Offer Proposal Line Item Model"
description: "Shared class `OfferProposalLineItemModel` (13 field(s)) from the okam Core library."
domain: offer
authority_tier: source
data_classification: schema-only
source_ref: "models/offer/offer-proposal-line-item-model.ts:1"
tags:
  - offer
  - model
  - class
---

TypeScript class `OfferProposalLineItemModel` (vendored into okam clients via the Core library).

# Fields

| Field | Type | Optional |
| --- | --- | --- |
| `id` | `number` | no |
| `offerProposalId` | `number` | no |
| `originalOfferItemId` | `string` | no |
| `name` | `string` | no |
| `description` | `string` | no |
| `internalDescription` | `string` | no |
| `quantity` | `number` | no |
| `notes` | `string` | no |
| `internalNotes` | `string` | no |
| `showMonthlyFee` | `boolean` | no |
| `showOnetimeFee` | `boolean` | no |
| `monthlyFee` | `number` | no |
| `onetimeFee` | `number` | no |
