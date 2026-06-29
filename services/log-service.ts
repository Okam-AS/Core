import { EventLog } from '../models'
import { ICoreInitializer } from '../interfaces'
import { RequestService } from './request-service'

export class LogService {
    private _requestService: RequestService;
    
    constructor (coreInitializer: ICoreInitializer) {
      this._requestService = new RequestService(coreInitializer)
    }

    public async Create(log: EventLog): Promise<boolean> {
      await this._requestService.PostRequest('/eventlogs', log)
      return true
    }
}
