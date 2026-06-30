---
type: service
resource: "okam://service/OfferProposalService"
title: "Offer Proposal Service"
description: "Shared service `OfferProposalService` — 10 public method(s), 10 HTTP call(s) — from the okam Core library."
domain: offer
authority_tier: source
data_classification: schema-only
source_ref: "services/offer-proposal-service.ts:10"
tags:
  - offer
  - service
---

TypeScript service `OfferProposalService` (vendored into okam clients via the Core library).

# Public methods

* `AcceptOfferWithVerification(id: number, model: AcceptOfferProposalModel): Promise<OfferProposalModel>`
* `CancelProposal(id: number): Promise<OfferProposalModel>`
* `CreateOrUpdateOfferProposal(id: number = 0, model: OfferProposalModel): Promise<OfferProposalModel>`
* `GetAll(): Promise<OfferProposalModel[]>`
* `GetByCode(code: string): Promise<OfferProposalModel>`
* `MarkAsRead(id: number): Promise<OfferProposalModel>`
* `RejectProposal(id: number): Promise<OfferProposalModel>`
* `SendProposalEmail(id: number, model: SendProposalModel = {}): Promise<boolean>`
* `SendProposalSms(id: number, model: SendProposalModel = {}): Promise<boolean>`
* `SendVerificationToken(id: number, model: SendVerificationTokenModel): Promise<boolean>`

# HTTP calls

| Method | Path |
| --- | --- |
| GET | `/offerproposals` |
| GET | `/offerproposals/${code}` |
| POST | `/offerproposals/${id}` |
| POST | `/offerproposals/${id}/accept-with-verification` |
| POST | `/offerproposals/${id}/cancel` |
| POST | `/offerproposals/${id}/mark-as-read` |
| POST | `/offerproposals/${id}/reject` |
| POST | `/offerproposals/${id}/send-proposal` |
| POST | `/offerproposals/${id}/send-proposal-email` |
| POST | `/offerproposals/${id}/send-verification` |
