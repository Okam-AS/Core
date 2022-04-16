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
      const payload = { cartId, amount, isApp }
      const response = await this._requestService.PostRequest('/vipps/initiate/', payload)
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

    public PullVerifyResult = (orderId: string, successHandler, failHandler) => {
      if (!orderId && failHandler) { failHandler() }
      if (!orderId) { return }
      const intervalId = setInterval(() => {
        this.Verify(orderId)
          .then((result) => { // result.status: 'Waiting', 'Success', or 'Fail'
            if (result.status === 'Success') {
              clearInterval(intervalId)
              if (successHandler) { successHandler(result.storeId) }
            } else if (result.status === 'Fail') {
              clearInterval(intervalId)
              if (failHandler) { failHandler(result.storeId) }
            }
          })
          .catch(() => {
            clearInterval(intervalId)
            failHandler()
          })
      }, 2000)
    }
}