import { ICoreInitializer } from "../interfaces";
import { StripeCreatePaymentIntent } from "../models";
import { RequestService } from "./";

export class StripeService {
  private _requestService: RequestService;

  constructor(coreInitializer: ICoreInitializer) {
    this._requestService = new RequestService(coreInitializer);
  }

  public async DeletePaymentMethod(paymentMethodId: string): Promise<boolean> {
    const response = await this._requestService.DeleteRequest(
      "/stripe/paymentMethod/" + paymentMethodId
    );
    return response && response.statusCode === 200;
  }

  public async CreatePaymentIntent(
    model: StripeCreatePaymentIntent
  ): Promise<any> {
    model.currency = "NOK";
    model.clientMajorVersion = 4;
    const response = await this._requestService.PostRequest(
      "/stripe/createPaymentIntent/",
      model
    );

    const parsedResponse = this._requestService.TryParseResponse(response);
    if (parsedResponse === undefined) {
      throw new Error("Betalingen ikke ikke gjennomføres på dette tidspunktet");
    }
    return parsedResponse;
  }
}
