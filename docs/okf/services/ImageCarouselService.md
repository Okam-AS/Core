---
type: service
resource: "okam://service/ImageCarouselService"
title: "Image Carousel Service"
description: "Shared service `ImageCarouselService` — 5 public method(s), 5 HTTP call(s) — from the okam Core library."
domain: image
authority_tier: source
data_classification: schema-only
source_ref: "services/image-carousel-service.ts:6"
tags:
  - image
  - service
---

TypeScript service `ImageCarouselService` (vendored into okam clients via the Core library).

# Public methods

* `CreateItem(imagePath: string, categoryId: string)`
* `CreateOrUpdateMarker(imageCarouselItemMarker: ImageCarouselItemMarker): Promise<ImageCarouselItemMarker>`
* `Delete(imageCarouselItemId: string): Promise<void>`
* `DeleteMarker(imageCarouselItemMarkerId: string): Promise<void>`
* `Reorder(categoryId: string, imageCarouselItems: Array<ImageCarouselItem>): Promise<void>`

# HTTP calls

| Method | Path |
| --- | --- |
| POST | `/imagecarousel/item` |
| DELETE | `/imagecarousel/item/` |
| POST | `/imagecarousel/marker` |
| DELETE | `/imagecarousel/marker/` |
| PUT | `/imagecarousel/reorder` |
