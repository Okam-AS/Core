---
type: service
resource: "okam://service/EmailCampaignService"
title: "Email Campaign Service"
description: "Shared service `EmailCampaignService` — 13 public method(s), 13 HTTP call(s) — from the okam Core library."
domain: email
authority_tier: source
data_classification: schema-only
source_ref: "services/email-campaign-service.ts:4"
tags:
  - email
  - service
---

TypeScript service `EmailCampaignService` (vendored into okam clients via the Core library).

# Public methods

* `CreateCampaign(storeId: number, data: any): Promise<any>`
* `DeleteCampaign(storeId: number, campaignId: string): Promise<any>`
* `DeleteImage(storeId: number, campaignId: string, imageId: string): Promise<any>`
* `FilterMembers(storeId: number, filter: any): Promise<any>`
* `GenerateEmail(storeId: number, campaignId: string, prompt: string): Promise<any>`
* `GetCampaign(storeId: number, campaignId: string): Promise<any>`
* `GetCampaigns(storeId: number): Promise<any>`
* `GetSendStatus(storeId: number, campaignId: string): Promise<any>`
* `RefineEmail(storeId: number, campaignId: string, prompt: string): Promise<any>`
* `SendTestEmail(storeId: number, campaignId: string, email: string): Promise<any>`
* `StartSending(storeId: number, campaignId: string): Promise<any>`
* `UpdateCampaign(storeId: number, campaignId: string, data: any): Promise<any>`
* `UploadImage(storeId: number, campaignId: string, file: File): Promise<any>`

# HTTP calls

| Method | Path |
| --- | --- |
| GET | `/emailcampaign/${storeId}/campaigns` |
| POST | `/emailcampaign/${storeId}/campaigns` |
| DELETE | `/emailcampaign/${storeId}/campaigns/${campaignId}` |
| GET | `/emailcampaign/${storeId}/campaigns/${campaignId}` |
| PUT | `/emailcampaign/${storeId}/campaigns/${campaignId}` |
| POST | `/emailcampaign/${storeId}/campaigns/${campaignId}/generate` |
| POST | `/emailcampaign/${storeId}/campaigns/${campaignId}/images` |
| DELETE | `/emailcampaign/${storeId}/campaigns/${campaignId}/images/${imageId}` |
| POST | `/emailcampaign/${storeId}/campaigns/${campaignId}/refine` |
| POST | `/emailcampaign/${storeId}/campaigns/${campaignId}/send` |
| GET | `/emailcampaign/${storeId}/campaigns/${campaignId}/send-status` |
| POST | `/emailcampaign/${storeId}/campaigns/${campaignId}/test-send` |
| POST | `/emailcampaign/${storeId}/filter-members` |
