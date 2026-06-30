---
type: service
resource: "okam://service/WoltMenuService"
title: "Wolt Menu Service"
description: "Shared service `WoltMenuService` — 8 public method(s), 8 HTTP call(s) — from the okam Core library."
domain: wolt
authority_tier: source
data_classification: schema-only
source_ref: "services/wolt-menu-service.ts:4"
tags:
  - wolt
  - service
---

TypeScript service `WoltMenuService` (vendored into okam clients via the Core library).

# Public methods

* `createMenu(storeId: number, request: any): Promise<boolean>`
* `deleteMenu(storeId: number): Promise<boolean>`
* `getMenu(storeId: number): Promise<any>`
* `importMenu(storeId: number): Promise<boolean>`
* `syncMenu(storeId: number): Promise<boolean>`
* `updateMenuItemInventory(storeId: number, request: any): Promise<boolean>`
* `updateMenuItems(storeId: number, request: any): Promise<boolean>`
* `updateMenuOptions(storeId: number, request: any): Promise<boolean>`

# HTTP calls

| Method | Path |
| --- | --- |
| DELETE | `/wolt/menu/stores/${storeId}` |
| GET | `/wolt/menu/stores/${storeId}` |
| POST | `/wolt/menu/stores/${storeId}` |
| POST | `/wolt/menu/stores/${storeId}/import` |
| PATCH | `/wolt/menu/stores/${storeId}/items` |
| PATCH | `/wolt/menu/stores/${storeId}/items/inventory` |
| PATCH | `/wolt/menu/stores/${storeId}/options` |
| POST | `/wolt/menu/stores/${storeId}/sync` |
