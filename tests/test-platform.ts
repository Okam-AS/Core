// Shared test scaffolding for the Pinia-backed stores.
//
// Any core store or service touches the platform registry (platform/index.ts): RequestService's
// constructor calls getHttpModule(), PersistenceService's calls getPersistenceModule(). Both throw
// until setPlatform() has run. Here we register inert, in-memory implementations so a store graph can
// be instantiated in a unit test without a real network or storage layer, then expose a helper that
// activates a fresh Pinia for each test.
import { setActivePinia, createPinia } from "pinia";
import { setPlatform } from "../platform";

// In-memory persistence: PersistenceService.load() JSON.parses whatever get() returns, so an empty
// store makes every `persistenceService.load(...) || fallback` in the stores fall back to its default.
class MemoryPersistenceModule {
  private store = new Map<string, string>();
  exists = (key: string) => this.store.has(key);
  get = (key: string) => this.store.get(key);
  set = (key: string, value: string) => {
    this.store.set(key, value);
  };
  delete = (key: string) => {
    this.store.delete(key);
  };
}

// Http module whose client rejects — the units under test either never hit the network (phone
// validation) or have their service method stubbed (TWINT poll / checkout). A rejecting client
// guarantees a test fails loudly rather than silently reaching a real endpoint.
class RejectingHttpModule {
  httpClient = () => Promise.reject(new Error("test http module: no network in unit tests"));
}

let registered = false;

export function registerTestPlatform() {
  if (registered) return;
  setPlatform(RejectingHttpModule as any, MemoryPersistenceModule as any);
  registered = true;
}

// Fresh Pinia per test keeps store state (refs, selected payment method, etc.) isolated across cases.
export function freshPinia() {
  registerTestPlatform();
  setActivePinia(createPinia());
}
