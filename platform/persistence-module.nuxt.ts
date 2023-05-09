import { IPersistenceModule } from '../interfaces'
class IPersistenceModuleNS implements IPersistenceModule {
  exists: any;
  get: any;
  set: any;
  delete: any;

  constructor () {

    const hasLocalStorage = () => {
      try {
        window.localStorage.setItem('localStorageTest', '1');
        window.localStorage.removeItem('localStorageTest');
        return true
      } catch (e) {
        return false
      }
    }

    this.exists = (key) => {
      return !!this.get(key)
    }
    this.get = (key) => {
      if (!hasLocalStorage()) return false;

      const data = window.localStorage.getItem(key) || ''
      try {
        return JSON.parse(data)
      } catch (e) {
        return data
      }
    }
    this.set = (key, value) => {
      if (!hasLocalStorage()) return
       
      let item = value
      if (typeof value === 'object') {
        item = JSON.stringify(value)
      }
      window.localStorage.setItem(key, item)
    }
    this.delete = (key) => {
      if (!hasLocalStorage()) return 
      
      window.localStorage.removeItem(key)
    }
  }
}

export const PersistenceModule = IPersistenceModuleNS
