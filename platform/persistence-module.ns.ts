import { IPersistenceModule } from '../../interfaces'
class IPersistenceModuleNS implements IPersistenceModule {
  exists: any;
  get: any;
  set: any;
  delete: any;

  constructor () {
    this.exists = (key) => {
      return require('@nativescript/core/' + 'application-settings').hasKey(key)
    }
    this.get = (key) => {
      return require('@nativescript/core/' + 'application-settings').getString(key)
    }
    this.set = (key, value) => {
      return require('@nativescript/core/' + 'application-settings').setString(key, value)
    }
    this.delete = (key) => {
      return require('@nativescript/core/' + 'application-settings').remove(key)
    }
  }
}

export const PersistenceModule = IPersistenceModuleNS