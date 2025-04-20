import { PersistenceModule } from '../platform'
import { watch, toRaw } from 'vue'

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

  public watchAndStore(item, key) {
    watch(item, (result) => {
      this._persistenceModule.set(key, JSON.stringify(toRaw(result)));
    }, { deep: true });

  }
}