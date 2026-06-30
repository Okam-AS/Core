---
type: model
resource: "okam://model/ImageCarouselItem"
title: "Image Carousel Item"
description: "Shared class `ImageCarouselItem` (5 field(s)) from the okam Core library."
domain: category
authority_tier: source
data_classification: schema-only
source_ref: "models/category/image-carousel-item.ts:3"
tags:
  - category
  - model
  - class
---

TypeScript class `ImageCarouselItem` (vendored into okam clients via the Core library).

# Fields

| Field | Type | Optional |
| --- | --- | --- |
| `id` | `string` | no |
| `orderIndex` | `number` | no |
| `markers` | `Array<ImageCarouselItemMarker>` | no |
| `image` | `ImageSource` | no |
| `categoryId` | `string` | no |
