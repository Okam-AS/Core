import { ICoreInitializer } from "../interfaces";
import { PaymentMethod } from "../models";
import { RequestService } from ".";

export class PaymentService {
  private _requestService: RequestService;

  constructor(coreInitializer: ICoreInitializer) {
    this._requestService = new RequestService(coreInitializer);
  }

  public async GetPaymentMethods(cartId?: string, clientSupportsDintero: boolean = false): Promise<PaymentMethod> {
    const response = await this._requestService.PostRequest("/payment/paymentMethods/", { cartId: cartId || "", clientSupportsDintero });
    const parsedResponse = this._requestService.TryParseResponse(response);
    if (parsedResponse === undefined) {
      throw new Error("Kunne ikke hente betalingsmetoder");
    }
    return parsedResponse;
  }

  public async GetPaymentMethodsForGiftcard(): Promise<PaymentMethod> {
    const response = await this._requestService.PostRequest("/payment/paymentMethods/giftcard");
    const parsedResponse = this._requestService.TryParseResponse(response);
    if (parsedResponse === undefined) {
      throw new Error("Kunne ikke hente betalingsmetoder");
    }
    return parsedResponse;
  }
}
