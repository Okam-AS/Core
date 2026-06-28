# Okam Core

Client-side models and core logic

## Required npm packages in project that runs Okam Core:

* typescript
* pinia 
* vue
* dayjs

## Platform registration (required)

Core is bundler-agnostic and holds **no** platform-specific code. It only defines
the contract — `interfaces/IHttpModule` and `interfaces/IPersistenceModule` — plus a
small registry (`platform/index.ts`). Each consuming app owns its own implementation
and registers it **once at startup**, before any core service or Pinia store is used:

```ts
import { setPlatform } from "<core>/platform";
import { HttpModule } from "./platform/http-module";          // app-owned impl of IHttpModule
import { PersistenceModule } from "./platform/persistence-module"; // app-owned impl of IPersistenceModule

setPlatform(HttpModule, PersistenceModule);
```

If a service/store runs before `setPlatform()`, `getHttpModule()` / `getPersistenceModule()`
throw a clear error. The app implementations depend on:

* **Web** (Nuxt): `axios` (httpClient) + `localStorage` (persistence)
* **NativeScript**: `@nativescript/core/http` + `@nativescript/background-http` (httpClient/bghttp)
  + `@nativescript/core/application-settings` (persistence)

## Required env variables:

* IS_PRODUCTION
* API_BASE_URL
* IS_NATIVESCRIPT
* VERSION
* STRIPE_PUBLISHABLE_KEY
* VIPPS_IOS_PATH
* VIPPS_ANDROID_PATH
* NOTIFICATION_HUB

# How to add to repo
```
git submodule add https://github.com/Okam-AS/Core.git core/
```

To get Okam Core in source control you sometimes need to delete the core folder and then add it again:

```
rm -rf .git/modules/Core && rm -rf .git/modules/core && git rm --cached core  
```
