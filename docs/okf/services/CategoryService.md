---
type: service
resource: "okam://service/CategoryService"
title: "Category Service"
description: "Shared service `CategoryService` — 15 public method(s), 12 HTTP call(s) — from the okam Core library."
domain: category
authority_tier: source
data_classification: schema-only
source_ref: "services/category-service.ts:6"
tags:
  - category
  - service
---

TypeScript service `CategoryService` (vendored into okam clients via the Core library).

# Public methods

* `Create(category: Category): Promise<Category>`
* `CreateOrUpdateCategoryProductList(categoryId: string, categoryProductListItems: Array<CategoryProductListItem>): Promise<Category>`
* `Delete(categoryId: string): Promise<void>`
* `DeleteCategoryProductListItem(categoryProductListItemId: string): Promise<void>`
* `DeleteImage(imageSourceId: string): Promise<void>`
* `Get(categoryId: string, forStore: boolean): Promise<Category>`
* `GetAll(storeId: number, forStore: boolean): Promise<Array<Category>>`
* `GetAllForConsumer(storeId: number, searchOptions: CategorySearchOptions): Promise<Array<Category>>`
* `GetForConsumer(categoryId: string, searchOptions: CategorySearchOptions): Promise<Category>`
* `GetImageSelection(categoryId: string): Promise<Category>`
* `HasAnyValid(storeId: number): Promise<Boolean>`
* `Reorder(storeId: number, categories: Array<Category>): Promise<Category>`
* `SearchProducts(storeId: number, searchTerm: string, searchOptions: CategorySearchOptions): Promise<Array<CategoryProductListItem>>`
* `Update(category: Category): Promise<Category>`
* `UploadImage(imagePath: string, categoryId: string)`

# HTTP calls

| Method | Path |
| --- | --- |
| POST | `/categories` |
| PUT | `/categories` |
| DELETE | `/categories/` |
| GET | `/categories/` |
| POST | `/categories/` |
| POST | `/categories/categoryproductlistitem` |
| DELETE | `/categories/categoryproductlistitem/` |
| DELETE | `/categories/image/` |
| PUT | `/categories/reorder` |
| POST | `/categories/search/store/` |
| GET | `/categories/store/` |
| POST | `/categories/store/` |
