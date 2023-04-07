import { IPersistenceModule } from '../interfaces'
class IPersistenceModuleNS implements IPersistenceModule {
  exists: any;
  get: any;
  set: any;
  delete: any;

  constructor () {
    this.exists = (key) => {
      // TODO: implement this for web
    }
    this.get = (key) => {
      // TODO: implement this for web
    }
    this.set = (key, value) => {
      // TODO: implement this for web
    }
    this.delete = (key) => {
      // TODO: implement this for web
    }
  }
}

export const PersistenceModule = IPersistenceModuleNS