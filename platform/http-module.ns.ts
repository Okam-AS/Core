import { IHttpModule } from '../interfaces'
class HttpModuleNS implements IHttpModule {
  httpClient: any;
  bghttp: any;

  constructor () {
    this.httpClient = (params) => {
      return require('@nativescript/core/http' + '').request(params)
    }
    this.bghttp = require('@nativescript/background-http' + '')
  }
}

export const HttpModule = HttpModuleNS