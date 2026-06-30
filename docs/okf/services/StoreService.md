---
type: service
resource: "okam://service/StoreService"
title: "Store Service"
description: "Shared service `StoreService` — 42 public method(s), 17 HTTP call(s) — from the okam Core library."
domain: store
authority_tier: source
data_classification: schema-only
source_ref: "services/store-service.ts:6"
tags:
  - store
  - service
---

TypeScript service `StoreService` (vendored into okam clients via the Core library).

# Public methods

* `AddEmployee(storeId: number, phoneNumber: string): Promise<boolean>`
* `CheckDeliveryAvailability(storeId: number, fullAddress: string, zipCode: string, city: string): Promise<`
* `CheckVatExists(vat: string): Promise<`
* `ConfigureWolt(storeId: number, options: { venueId: string, clientId: string, clientSecret: string, accessToken: string, refreshToken: string }): Promise<boolean>`
* `CreateOrUpdateHomeDeliveryFromAddress(storeId: number, address: Address): Promise<boolean>`
* `CreateOrUpdateStoreUserSetting(storeId: number, model: StoreUserSetting): Promise<boolean>`
* `Delete(id: number): Promise<boolean>`
* `Feedback(feedback: string)`
* `Get(id: number): Promise<Store>`
* `GetAll(location?: any): Promise<Array<Store>>`
* `GetBrregData(vat: string): Promise<BrregData>`
* `GetBySlug(slug: string): Promise<`
* `GetCustomerStatistics(storeId: number, daysAgo: number): Promise<any>`
* `GetDinteroConfig(storeId: number): Promise<any>`
* `GetFees(id: number): Promise<StoreFees>`
* `GetForConsumer(id: number, searchOptions: CategorySearchOptions): Promise<Store>`
* `GetOverview(options: { from: string, to: string }): Promise<StoreOverviewResponseModel>`
* `GetPaymentConfig(storeId: number): Promise<StorePaymentConfig>`
* `ImageExists(imageUrl: string)`
* `KeyAccountManagerUpdate(storeId: number, options: { kamUserId: string, status: string, notes: string }): Promise<boolean>`
* `Publish(storeId: number, options: { publish: boolean }): Promise<boolean>`
* `Register(name: string, legalName: string, vat: number, fullAddress: string, zipCode: string, city: string, acceptedTerms: boolean)`
* `RemoveEmployee(storeId: number, userId: string): Promise<boolean>`
* `RetryDineHomeOrder(storeId: number, orderCode: string): Promise<boolean>`
* `SearchCustomers(storeId: number, query: string): Promise<any>`
* `SetMinimumAmountForDelivery(storeId: number, amount: number): Promise<boolean>`
* `UpdateAddress(storeId: number, address: Address): Promise<boolean>`
* `UpdateAllowOrdersAfterOpeningHours(storeId: number, newValue: boolean): Promise<boolean>`
* `UpdateDineHomeDelivery(storeId: number, newValue: boolean): Promise<boolean>`
* `UpdateDinteroConfig(storeId: number, options: { dinteroEnabled: boolean, dinteroAccountId: string, clientId: string, clientSecret: string, vippsEnabled: boolean, applePayEnabled: boolean, creditCardEnabled: boolean, googlePayEnabled: boolean, klarnaEnabled: boolean, billieEnabled: boolean, commissionPercentage: number, splitSellerId: string }): Promise<boolean>`
* `UpdateHomeDelivery(storeId: number, newValue: boolean): Promise<boolean>`
* `UpdateOpeningHours(storeId: number, openingHours: Array<OpeningHour>): Promise<boolean>`
* `UpdatePayment(storeId: number, model: StorePayment): Promise<boolean>`
* `UpdateRushMode(storeId: number, newValue: boolean): Promise<boolean>`
* `UpdateSelfCheckout(storeId: number, newValue: boolean): Promise<boolean>`
* `UpdateSelfPickUp(storeId: number, newValue: boolean): Promise<boolean>`
* `UpdateStatusMessage(storeId: number, statusMessage: string): Promise<boolean>`
* `UpdateTableDelivery(storeId: number, newValue: boolean): Promise<boolean>`
* `UpdateTip(storeId: number, tip: StoreTip): Promise<boolean>`
* `UpdateWoltDelivery(storeId: number, newValue: boolean): Promise<boolean>`
* `UpdateWoltMarketplaceConfiguration(storeId: number, configuration: { Enabled: boolean }): Promise<any>`
* `UploadLogo(imagePath, storeId: number)`

# HTTP calls

| Method | Path |
| --- | --- |
| GET | `/stores` |
| DELETE | `/stores/` |
| GET | `/stores/` |
| POST | `/stores/` |
| PUT | `/stores/` |
| POST | `/stores/${storeId}/delivery-availability` |
| POST | `/stores/addemployee` |
| GET | `/stores/brreg/` |
| GET | `/stores/check-vat/` |
| POST | `/stores/customers` |
| POST | `/stores/customers/statistics` |
| POST | `/stores/feedback` |
| POST | `/stores/logo` |
| POST | `/stores/overview` |
| POST | `/stores/register` |
| POST | `/stores/removeemployee/` |
| GET | `/stores/slug/${slug}` |
