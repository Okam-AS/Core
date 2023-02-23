import { ICoreInitializer } from '../interfaces'
import { PaymentMethod } from '../models'
import { RequestService } from '.'

export class PaymentService {
    private _requestService: RequestService;

    constructor (coreInitializer: ICoreInitializer) {
      this._requestService = new RequestService(coreInitializer)
    }

    public async GetPaymentMethods (cartId?: string): Promise<PaymentMethod> {
      const response = await this._requestService.PostRequest('/payment/paymentMethods/', { cartId: (cartId || '') })
      const parsedResponse = this._requestService.TryParseResponse(response)
      if (parsedResponse === undefined) { throw new Error('Kunne ikke hente betalingsmetoder') }
      return parsedResponse
    }
}