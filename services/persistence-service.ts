import { PersistenceModule } from '../platform'

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
    try {
      const vue = require('vue');
      if (vue.watch && vue.toRaw) {
        vue.watch(item, (result: any) => {
          this._persistenceModule.set(key, JSON.stringify(vue.toRaw(result)));
        }, { deep: true });
      }
    } catch (e) {
      // Vue 3 watch/toRaw not available in Vue 2 projects
    }
  }
}
