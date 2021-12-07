import $config from '../helpers/configuration'
import { IVuexModule } from '../interfaces'
import { RequestService } from './'

export class StripeService {
    private _requestService: RequestService;
    private _vuexModule: IVuexModule;

    constructor (vuexModule: IVuexModule) {
      this._requestService = new RequestService(vuexModule, $config.okamApiBaseUrl)
      this._vuexModule = vuexModule
    }

    public async GetPaymentMethods (storeId: number): Promise<any> {
      const response = await this._requestService.GetRequest('/payment/paymentMethods/' + storeId)
      const parsedResponse = this._requestService.TryParseResponse(response)
      if (parsedResponse === undefined) { throw new Error('Kunne ikke hente kort') }
      return parsedResponse
    }

    public async DeletePaymentMethod (paymentMethodId: string): Promise<boolean> {
      const response = await this._requestService.DeleteRequest('/payment/paymentMethod/' + paymentMethodId)
      return response && response.statusCode === 200
    }

    public async CreatePaymentIntent (amount: number, currency: string, paymentMethodId: string, cartId: string, setupFutureUsage: boolean): Promise<any> {
      const response = await this._requestService.PostRequest('/payment/createPaymentIntent/', {
        amount,
        currency,
        paymentMethodId,
        cartId,
        setupFutureUsage
      })

      const parsedResponse = this._requestService.TryParseResponse(response)
      if (parsedResponse === undefined) { throw new Error('Betalingen ikke ikke gjennomføres på dette tidspunktet') }
      return parsedResponse
    }
}