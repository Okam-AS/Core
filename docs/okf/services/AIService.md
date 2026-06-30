---
type: service
resource: "okam://service/AIService"
title: "AI Service"
description: "Shared service `AIService` — 2 public method(s), 2 HTTP call(s) — from the okam Core library."
domain: ai
authority_tier: source
data_classification: schema-only
source_ref: "services/ai-service.ts:4"
tags:
  - ai
  - service
---

TypeScript service `AIService` (vendored into okam clients via the Core library).

# Public methods

* `AskQuestion(question: string, selectedStoreIds?: number[], languageCode?: string): Promise<any>`
* `MenuToJson(storeId: number, pageContent: string, extraInstructions: string): Promise<any>`

# HTTP calls

| Method | Path |
| --- | --- |
| POST | `/ai/menu-to-json` |
| POST | `/chat/ask` |
