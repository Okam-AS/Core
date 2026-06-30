---
type: service
resource: "okam://service/PlaceService"
title: "Place Service"
description: "Shared service `PlaceService` — 1 public method(s), 1 HTTP call(s) — from the okam Core library."
domain: place
authority_tier: source
data_classification: schema-only
source_ref: "services/place-service.ts:14"
tags:
  - place
  - service
---

TypeScript service `PlaceService` (vendored into okam clients via the Core library).

# Public methods

* `SearchPlaces(params: PlaceSearchParams): Promise<PlaceSearchResponse>`

# HTTP calls

| Method | Path |
| --- | --- |
| POST | `/places/search` |
