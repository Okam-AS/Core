# Okam Core

Client-side models and core logic

## Required npm packages in project that runs Okam Core:

* typescript
* ts-transformer-keys
* pinia 
* vue

On NS:
* @nativescript/core/http
* @nativescript/background-http

On Web:
* axios

## Required env variables:

* IS_PRODUCTION
* API_BASE_URL
* IS_NATIVESCRIPT
* VERSION
* STRIPE_PUBLISHABLE_KEY
* VIPPS_IOS_PATH
* VIPPS_ANDROID_PATH
* PLATFORM_FILE_SUFFIX
* NOTIFICATION_HUB

# How to add to repo
```
git submodule add https://github.com/Okam-AS/Core.git core/
```

To get Okam Core in source control you sometimes need to delete the core folder and then add it again:

```
rm -rf .git/modules/Core && rm -rf .git/modules/core && git rm --cached core  
```
