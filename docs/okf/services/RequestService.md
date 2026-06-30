---
type: service
resource: "okam://service/RequestService"
title: "Request Service"
description: "Shared service `RequestService` — 10 public method(s), 0 HTTP call(s) — from the okam Core library."
domain: request
authority_tier: source
data_classification: schema-only
source_ref: "services/request-service.ts:6"
tags:
  - request
  - service
---

TypeScript service `RequestService` (vendored into okam clients via the Core library).

# Public methods

* `DeleteRequest(path: string): Promise<any>`
* `FormdataRequest(path: string, method: HttpMethod, fileParamName: string, filePath: string, otherParams?: Array<any>): any`
* `GetHeadRequest(fullPath: string): Promise<any>`
* `GetRequest(path: string): Promise<any>`
* `PatchRequest(path: string, payload?: any): Promise<any>`
* `PostFormDataRequest(path: string, formData: any): Promise<any>`
* `PostRequest(path: string, payload?: any): Promise<any>`
* `PutRequest(path: string, payload?: any): Promise<any>`
* `TryParseResponse(response)`
* `TryParseResponseWithError(response)`

# HTTP calls

_No HTTP calls (local/utility service)._
