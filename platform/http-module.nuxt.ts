import { IHttpModule } from '../interfaces'

class HttpModuleNUXT implements IHttpModule {
  httpClient: any;

  constructor () {
    this.httpClient = require('axios')
  }
}

export const HttpModule = HttpModuleNUXT