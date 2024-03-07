import { ICoreInitializer } from '../interfaces'
import { RequestService } from '.'

export class RewardService {  
 
  private _requestService: RequestService;

  constructor (coreInitializer: ICoreInitializer) {
    this._requestService = new RequestService(coreInitializer)
  }

  public async Get(storeId: number) {
    const response = await this._requestService.GetRequest('/rewards/' + storeId)
    const parsedResponse = this._requestService.TryParseResponse(response)
    if (parsedResponse === undefined) { throw new Error('Failed to get programs') }

    return parsedResponse
  }

}