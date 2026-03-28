import { ICoreInitializer } from "../interfaces";
import { VippsInitiateResponse, VippsVerifyResponse } from "../models";
import { RequestService } from ".";

export class VippsService {
  private _requestService: RequestService;

  constructor(coreInitializer: ICoreInitializer) {
    this._requestService = new RequestService(coreInitializer);
  }

  public async Initiate(cartId: string, giftcardId: string, amount: number, isApp: boolean): Promise<VippsInitiateResponse> {
    const response = await this._requestService.PostRequest("/vipps/initiate/", { cartId, giftcardId, amount, isApp });
    const parsedResponse = this._requestService.TryParseResponse(response);
    if (parsedResponse === undefined) {
      throw new Error("Kunne ikke betale med Vipps");
    }
    return parsedResponse;
  }

  public async Verify(orderId: string): Promise<VippsVerifyResponse> {
    const response = await this._requestService.GetRequest("/vipps/verify/" + orderId);
    const parsedResponse = this._requestService.TryParseResponse(response);
    if (parsedResponse === undefined) {
      throw new Error("Kunne ikke verifisere Vipps-betaling");
    }
    return parsedResponse;
  }

  public PullVerifyResult = (orderId: string, successHandler, failHandler) => {
    if (!orderId && failHandler) {
      failHandler();
    }
    if (!orderId) {
      return;
    }
    let intervalId;
    const poll = () => {
      this.Verify(orderId)
        .then((result) => {
          if (result.status === "Success") {
            clearInterval(intervalId);
            if (successHandler) successHandler(result);
          } else if (result.status === "Fail") {
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
      this.Verify(orderId)
        .then((result) => {
          if (result.status === "Success") {
            if (successHandler) successHandler(result);
          } else if (result.status === "Fail") {
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
