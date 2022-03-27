import $config from '../helpers/configuration'
import { IVuexModule } from '../interfaces'
import { InitiateVippsResponse } from '../models'
import { RequestService } from '.'

export class VippsService {
    private _requestService: RequestService;
    private _vuexModule: IVuexModule;

    constructor (vuexModule: IVuexModule) {
      this._requestService = new RequestService(vuexModule, $config.okamApiBaseUrl)
      this._vuexModule = vuexModule
    }

    public async Initiate (cartId: string, amount: number, isApp: boolean): Promise<InitiateVippsResponse> {
      const response = await this._requestService.PostRequest('/vipps/initiate/', {cartId,amount,isApp})
      const parsedResponse = this._requestService.TryParseResponse(response)
      if (parsedResponse === undefined) { throw new Error('Kunne ikke betale med Vipps') }
      return parsedResponse
    }
}