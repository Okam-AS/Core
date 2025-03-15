import $config from "../helpers/configuration";
import { IVuexModule } from "../interfaces";
import { PaymentMethod } from "../models";
import { RequestService } from ".";

export class PaymentService {
  private _requestService: RequestService;
  private _vuexModule: IVuexModule;

  constructor(vuexModule: IVuexModule) {
    this._requestService = new RequestService(vuexModule, $config.okamApiBaseUrl);
    this._vuexModule = vuexModule;
  }

  public async GetPaymentMethods(cartId?: string, clientSupportsDintero: boolean = false): Promise<PaymentMethod> {
    const response = await this._requestService.PostRequest("/payment/paymentMethods/", { cartId: cartId || "", clientSupportsDintero });
    const parsedResponse = this._requestService.TryParseResponse(response);
    if (parsedResponse === undefined) {
      throw new Error("Kunne ikke hente betalingsmetoder");
    }
    return parsedResponse;
  }
}
