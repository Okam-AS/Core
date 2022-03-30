import $config from '../helpers/configuration'
import { IVuexModule } from '../interfaces'
import { VippsInitiateResponse, VippsVerifyResponse } from '../models'
import { RequestService } from '.'

export class VippsService {
    private _requestService: RequestService;
    private _vuexModule: IVuexModule;

    constructor (vuexModule: IVuexModule) {
      this._requestService = new RequestService(vuexModule, $config.okamApiBaseUrl)
      this._vuexModule = vuexModule
    }

    public async Initiate (cartId: string, amount: number, isApp: boolean): Promise<VippsInitiateResponse> {
      const response = await this._requestService.PostRequest('/vipps/initiate/', { cartId, amount, isApp })
      const parsedResponse = this._requestService.TryParseResponse(response)
      if (parsedResponse === undefined) { throw new Error('Kunne ikke betale med Vipps') }
      return parsedResponse
    }

    public async Verify (orderId: string): Promise<VippsVerifyResponse> {
      const response = await this._requestService.GetRequest('/vipps/verify/' + orderId)
      const parsedResponse = this._requestService.TryParseResponse(response)
      if (parsedResponse === undefined) { throw new Error('Kunne ikke verifisere Vipps-betaling') }
      return parsedResponse
    }
}