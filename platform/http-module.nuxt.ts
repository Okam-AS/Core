import { IHttpModule } from '../interfaces'
import axios from 'axios';
class HttpModuleNUXT implements IHttpModule {
  httpClient: any;

  constructor () {
     this.httpClient = axios
  }
}

export const HttpModule = HttpModuleNUXT