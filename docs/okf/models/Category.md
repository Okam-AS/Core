---
type: model
resource: "okam://model/Category"
title: "Category"
description: "Shared class `Category` (19 field(s)) from the okam Core library."
domain: category
authority_tier: source
data_classification: schema-only
source_ref: "models/category/category.ts:4"
tags:
  - category
  - model
  - class
---

TypeScript class `Category` (vendored into okam clients via the Core library).

# Fields

| Field | Type | Optional |
| --- | --- | --- |
| `id` | `string` | no |
| `orderIndex` | `number` | no |
| `name` | `string` | no |
| `image` | `ImageSource` | no |
| `hide` | `boolean` | no |
| `soldOut` | `boolean` | no |
| `published` | `boolean` | no |
| `startPublish` | `Date` | no |
| `stopPublish` | `Date` | no |
| `imageCarouselEnabled` | `boolean` | no |
| `imageCarouselItems` | `Array<ImageCarouselItem>` | no |
| `categoryProductListEnabled` | `boolean` | no |
| `categoryProductListItems` | `Array<CategoryProductListItem>` | no |
| `storeId` | `number` | no |
| `hideFromDeliveryTypes` | `Array<DeliveryType>` | no |
| `publishRules` | `Array<CategoryPublishRule>` | no |
| `productVariants` | `Array<ProductVariant>` | no |
| `handlePublishRules` | `boolean` | no |
| `loaded` | `boolean` | no |
