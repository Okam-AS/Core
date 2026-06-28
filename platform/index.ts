// Platform registry — core is bundler-agnostic.
//
// Core no longer selects the platform implementation (that caused cross-bundler
// breakage: `require` is undefined in Vite, top-level `await` can't be parsed by
// webpack 4, etc.). Instead each app — which already knows its own platform —
// statically imports the right variant and registers it ONCE at startup via
// setPlatform(). This mirrors the existing setTranslationProvider/setCurrencyFormat
// provider pattern.
//
//   web (ConsumerWeb/Web):   import HttpModule/PersistenceModule from './platform/*.nuxt'
//   native (ConsumerApp/AdminApp): ...from './platform/*.ns'
//   then: setPlatform(HttpModule, PersistenceModule)
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
