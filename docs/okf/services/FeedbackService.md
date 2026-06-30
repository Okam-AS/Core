---
type: service
resource: "okam://service/FeedbackService"
title: "Feedback Service"
description: "Shared service `FeedbackService` — 2 public method(s), 2 HTTP call(s) — from the okam Core library."
domain: feedback
authority_tier: source
data_classification: schema-only
source_ref: "services/feedback-service.ts:5"
tags:
  - feedback
  - service
---

TypeScript service `FeedbackService` (vendored into okam clients via the Core library).

# Public methods

* `CreateFeedback(model: Feedback): Promise<boolean>`
* `FeedbackShown(): Promise<boolean>`

# HTTP calls

| Method | Path |
| --- | --- |
| POST | `/feedback` |
| PUT | `/feedback/shown` |
