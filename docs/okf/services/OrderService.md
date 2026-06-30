---
type: service
resource: "okam://service/OrderService"
title: "Order Service"
description: "Shared service `OrderService` — 15 public method(s), 14 HTTP call(s) — from the okam Core library."
domain: order
authority_tier: source
data_classification: schema-only
source_ref: "services/order-service.ts:6"
tags:
  - order
  - service
---

TypeScript service `OrderService` (vendored into okam clients via the Core library).

# Public methods

* `ChangeDeliveryType(orderCode: string, deliveryType: string): Promise<boolean>`
* `CompleteAll(storeId: number): Promise<Array<Order>>`
* `GetAll(): Promise<Array<Order>>`
* `GetAllOngoing(): Promise<Array<Order>>`
* `GetAllOrdersWithPagination(page: number = 1, pageSize: number = 20, search?: string, dateFrom?: string, dateTo?: string, storeIds?: number[], statuses?: string[], deliveryTypes?: string[], paymentTypes?: string[]): Promise<any>`
* `GetByCode(orderCode: string): Promise<Order>`
* `GetOngoing(storeId: number): Promise<Array<Order>>`
* `GetOrder(orderCode: string): Promise<Order>`
* `GetStoresOrders(storeId: number, partially: boolean): Promise<Array<Order>>`
* `Processing(orderId: string, remainingMinutes: number, remainingMinutesToStartProcessing: number = 0): Promise<Order>`
* `Refund(orderId: string): Promise<boolean>`
* `SendReceiptByMail(orderCode: string): Promise<Order>`
* `SendSmsToDriver(orderCode: string, phoneNumber: string): Promise<boolean>`
* `TransferOrder(orderCode: string, targetStoreId: number): Promise<boolean>`
* `UpdateStatus(orderId: string, status: OrderStatus): Promise<Order>`

# HTTP calls

| Method | Path |
| --- | --- |
| GET | `/orders` |
| GET | `/orders/` |
| GET | `/orders/${orderCode}` |
| PUT | `/orders/change-delivery-type` |
| POST | `/orders/complete-all/` |
| GET | `/orders/ongoing` |
| GET | `/orders/ongoing/` |
| PUT | `/orders/processing/` |
| GET | `/orders/receipt/` |
| GET | `/orders/refund/` |
| POST | `/orders/send-sms-to-driver` |
| GET | `/orders/store/` |
| POST | `/orders/transfer` |
| PUT | `/orders/update/` |
