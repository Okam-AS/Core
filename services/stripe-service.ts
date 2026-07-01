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
    // Region-aware charge currency. The real source is the store/cart context
    // (set in pinia/checkout.ts); this is only a safety net so a caller that
    // never set it still sends a valid ISO-4217 code. Defaults to Norway's "NOK"
    // to preserve existing NO behaviour — Swiss stores set "CHF" upstream.
    model.currency = model.currency || "NOK";
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

  public async CreatePaymentIntentLegacy(amount: number, currency: string, paymentMethodId: string, cartId: string, setupFutureUsage: boolean): Promise<any> {
    const response = await this._requestService.PostRequest('/stripe/createPaymentIntent/', {
      amount,
      currency,
      paymentMethodId,
      cartId,
      setupFutureUsage
    });

    const parsedResponse = this._requestService.TryParseResponse(response);
    if (parsedResponse === undefined) { throw new Error('Betalingen ikke ikke gjennomføres på dette tidspunktet'); }
    return parsedResponse;
  }

  // TWINT completes out-of-band: the customer approves in their banking app and the
  // order is booked server-side (Stripe webhook). The client cannot infer success from
  // the confirmTwintPayment call, so it polls GET /stripe/verify/{paymentIntentId} — the
  // server is the source of truth — exactly like vippsService.Verify / PullVerifyResult.
  public async Verify(paymentIntentId: string): Promise<any> {
    const response = await this._requestService.GetRequest("/stripe/verify/" + paymentIntentId);
    const parsedResponse = this._requestService.TryParseResponse(response);
    if (parsedResponse === undefined) {
      throw new Error("Kunne ikke verifisere TWINT-betaling");
    }
    return parsedResponse;
  }

  // Mirrors vippsService.PullVerifyResult: a leading verify after ~800ms (covers the
  // common fast-approval case without a full interval of latency), then poll every
  // 1800ms until the server reports a terminal state. The backend StripeVerifyStatus
  // enum is Waiting=100 / Success=200 / Fail=300; it is serialized as its string name
  // over the wire (like Vipps), so accept both the name and the numeric code to stay
  // correct regardless of the transport's enum encoding.
  public PullVerifyTwintResult = (paymentIntentId: string, successHandler, failHandler) => {
    if (!paymentIntentId && failHandler) {
      failHandler();
    }
    if (!paymentIntentId) {
      return;
    }
    const isSuccess = (status) => status === "Success" || status === 200;
    const isFail = (status) => status === "Fail" || status === 300;
    let intervalId;
    const poll = () => {
      this.Verify(paymentIntentId)
        .then((result) => {
          if (isSuccess(result.status)) {
            clearInterval(intervalId);
            if (successHandler) successHandler(result);
          } else if (isFail(result.status)) {
            clearInterval(intervalId);
            if (failHandler) failHandler(result);
          }
        })
        .catch(() => {
          clearInterval(intervalId);
          if (failHandler) failHandler();
        });
    };

    setTimeout(() => {
      this.Verify(paymentIntentId)
        .then((result) => {
          if (isSuccess(result.status)) {
            if (successHandler) successHandler(result);
          } else if (isFail(result.status)) {
            if (failHandler) failHandler(result);
          } else {
            intervalId = setInterval(poll, 1800);
          }
        })
        .catch(() => {
          if (failHandler) failHandler();
        });
    }, 800);
  };
}
