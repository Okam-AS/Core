// Platform registry — core is bundler-agnostic and holds NO platform-specific code.
//
// Core defines only the contract (interfaces/IHttpModule, interfaces/IPersistenceModule)
// and this registry. Each consuming app OWNS its platform implementation (a thin
// adapter over axios/localStorage for web, or @nativescript/core for native) and
// registers it ONCE at startup via setPlatform(). Mirrors the existing
// setTranslationProvider / setCurrencyFormat provider pattern.
//
//   web (ConsumerWeb/Web):          import its own ./platform/{http,persistence}-module
//   native (ConsumerApp/AdminApp):  import its own ./platform/{http,persistence}-module
//   then at startup: setPlatform(HttpModule, PersistenceModule)
//
// Register as early as possible (before any core service or Pinia store is used).

let _HttpModule: any = null;
let _PersistenceModule: any = null;

export function setPlatform(httpModule: any, persistenceModule: any) {
  _HttpModule = httpModule;
  _PersistenceModule = persistenceModule;
}

export function getHttpModule(): any {
  if (!_HttpModule) {
    throw new Error("core/platform: HttpModule not registered — call setPlatform(HttpModule, PersistenceModule) at app startup before using core services.");
  }
  return _HttpModule;
}

export function getPersistenceModule(): any {
  if (!_PersistenceModule) {
    throw new Error("core/platform: PersistenceModule not registered — call setPlatform(HttpModule, PersistenceModule) at app startup before using core stores.");
  }
  return _PersistenceModule;
}
