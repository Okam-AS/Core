import { PersistenceModule } from '../platform'
// Static namespace import so it works under Vite (Nuxt 3) — `require('vue')` is
// undefined there and silently disabled persistence, losing all Pinia state on
// every (full-reload) navigation. In Vue 2 builds without the Composition API,
// `watch`/`toRaw` are simply absent on the namespace and watchAndStore no-ops.
import * as vueApi from 'vue'

export class PersistenceService {
  private _persistenceModule: typeof PersistenceModule

  constructor() {
    this._persistenceModule = new PersistenceModule()
  }

  public delete(key: string) {
    this._persistenceModule.delete(key)
  }

  public load<T>(key) {
    if (this._persistenceModule.exists(key)) {
      const value = this._persistenceModule.get(key)
      if (value === undefined || value === null || value === "undefined") {
        return null;
      }
      try {
        return JSON.parse(value) as T;
      } catch (e) {
        this._persistenceModule.delete(key);
        return null;
      }
    }
    return null
  }

  public watchAndStore(item: any, key: string) {
    const watch = (vueApi as any).watch;
    const toRaw = (vueApi as any).toRaw;
    if (typeof watch === 'function' && typeof toRaw === 'function') {
      watch(item, (result: any) => {
        this._persistenceModule.set(key, JSON.stringify(toRaw(result)));
      }, { deep: true });
    }
  }
}
