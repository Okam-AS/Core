import { IServiceCtor } from '../interfaces'
import { PaymentMethod } from '../models'
import { RequestService } from '.'

export class PaymentService {
    private _requestService: RequestService;

    constructor (serviceCtor: IServiceCtor) {
      this._requestService = new RequestService(serviceCtor)
    }

    public async GetPaymentMethods (cartId?: string): Promise<PaymentMethod> {
      const response = await this._requestService.PostRequest('/payment/paymentMethods/', { cartId: (cartId || '') })
      const parsedResponse = this._requestService.TryParseResponse(response)
      if (parsedResponse === undefined) { throw new Error('Kunne ikke hente betalingsmetoder') }
      return parsedResponse
    }
}