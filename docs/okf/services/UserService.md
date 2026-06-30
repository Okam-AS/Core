---
type: service
resource: "okam://service/UserService"
title: "User Service"
description: "Shared service `UserService` — 18 public method(s), 13 HTTP call(s) — from the okam Core library."
domain: user
authority_tier: source
data_classification: schema-only
source_ref: "services/user-service.ts:5"
tags:
  - user
  - service
---

TypeScript service `UserService` (vendored into okam clients via the Core library).

# Public methods

* `AddFavoriteProduct(productId: string): Promise<boolean>`
* `ConfirmEmail(code: string): Promise<boolean>`
* `Delete(logoutFunction?: Function): Promise<boolean>`
* `Get(): Promise<User>`
* `GetForStore(storeId: number, userId: string): Promise<UserForStore>`
* `GetRewardCard(storeId?: number): Promise<RewardCard>`
* `GetRewardCards(): Promise<RewardCard>`
* `Login(phoneNumber: string, token: string): Promise<User>`
* `LoginAdmin(phoneNumber: string, token: string, setCurrentStoreFunction?: Function): Promise<boolean>`
* `Logout(notificationId?: string, clearState?: Function)`
* `Reload(): Promise<User>`
* `RemoveFavoriteProduct(productId: string): Promise<boolean>`
* `SendEmailConfirmationCode(email: string): Promise<boolean>`
* `SendVerificationToken(phoneNumber: string): Promise<boolean>`
* `TokenIsValid(): Promise<boolean>`
* `UpdateAddress(fullAddress: string, zipCode: string, city: string, deliveryInstructions?: string): Promise<boolean>`
* `UpdateName(firstName: string, lastName: string): Promise<boolean>`
* `VerifyToken(phoneNumber: string, token: string): Promise<boolean>`

# HTTP calls

| Method | Path |
| --- | --- |
| DELETE | `/user` |
| GET | `/user` |
| GET | `/user/${storeId}/${userId}` |
| POST | `/user/address/` |
| POST | `/user/confirm-email/` |
| POST | `/user/favorite/add/` |
| POST | `/user/favorite/remove/` |
| POST | `/user/login` |
| POST | `/user/name/` |
| GET | `/user/rewardcard/` |
| GET | `/user/rewardcards/` |
| POST | `/user/send-email-confirmation-code/` |
| POST | `/user/sendverificationtoken` |
