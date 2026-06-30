---
type: service
resource: "okam://service/NotificationService"
title: "Notification Service"
description: "Shared service `NotificationService` — 2 public method(s), 3 HTTP call(s) — from the okam Core library."
domain: notification
authority_tier: source
data_classification: schema-only
source_ref: "services/notification-service.ts:7"
tags:
  - notification
  - service
---

TypeScript service `NotificationService` (vendored into okam clients via the Core library).

# Public methods

* `Deactivate(notificationId?: string)`
* `RegisterNotificationOnServer(token, platform: NotificationPlatform, storeId?: number)`

# HTTP calls

| Method | Path |
| --- | --- |
| DELETE | `/notification/` |
| GET | `/notification/` |
| PUT | `/notification/` |
