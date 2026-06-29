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

import { IHttpModule, IPersistenceModule } from "../interfaces";

// setPlatform receives the CLASSES (constructors), not instances — core does
// `new (getHttpModule())()` when it needs one. So the registry is typed with
// constructor types, which enforces that whatever an app registers actually
// produces an IHttpModule / IPersistenceModule.
type HttpModuleCtor = new () => IHttpModule;
type PersistenceModuleCtor = new () => IPersistenceModule;

let _HttpModule: HttpModuleCtor | null = null;
let _PersistenceModule: PersistenceModuleCtor | null = null;

export function setPlatform(httpModule: HttpModuleCtor, persistenceModule: PersistenceModuleCtor) {
  _HttpModule = httpModule;
  _PersistenceModule = persistenceModule;
}

export function getHttpModule(): HttpModuleCtor {
  if (!_HttpModule) {
    throw new Error("core/platform: HttpModule not registered — call setPlatform(HttpModule, PersistenceModule) at app startup before using core services.");
  }
  return _HttpModule;
}

export function getPersistenceModule(): PersistenceModuleCtor {
  if (!_PersistenceModule) {
    throw new Error("core/platform: PersistenceModule not registered — call setPlatform(HttpModule, PersistenceModule) at app startup before using core stores.");
  }
  return _PersistenceModule;
}
