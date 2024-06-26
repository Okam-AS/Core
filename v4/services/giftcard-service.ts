import { ICoreInitializer } from "../interfaces";
import { RequestService } from ".";
import { Giftcard, UsersGiftcardBalance, InitiateGiftcardPurchase, GiftcardPurchaseValidationResponse } from "../models";

export class GiftcardService {
  private _requestService: RequestService;

  constructor(coreInitializer: ICoreInitializer) {
    this._requestService = new RequestService(coreInitializer);
  }

  public async Validate(giftcard: Giftcard) {
    const response = await this._requestService.PostRequest("/giftcard/validate/", giftcard);
    const parsedResponse = this._requestService.TryParseResponse(response);
    if (parsedResponse === undefined) {
      throw new Error("Failed to validate gift card");
    }

    return parsedResponse;
  }

  public async MyBalance(): Promise<UsersGiftcardBalance> {
    const response = await this._requestService.GetRequest("/giftcard/mybalance");
    const parsedResponse = this._requestService.TryParseResponse(response);
    if (parsedResponse === undefined) {
      throw new Error("Failed to get gift card balance");
    }
    return parsedResponse;
  }

  public async Get(giftcardId: string): Promise<Giftcard> {
    const response = await this._requestService.GetRequest("/giftcard/" + giftcardId);
    const parsedResponse = this._requestService.TryParseResponse(response);
    if (parsedResponse === undefined) {
      throw new Error("Failed to get gift card");
    }
    return parsedResponse;
  }

  public async GetPurchases(): Promise<Array<Giftcard>> {
    const response = await this._requestService.GetRequest("/giftcard/purchases");
    const parsedResponse = this._requestService.TryParseResponse(response);
    if (parsedResponse === undefined) {
      throw new Error("Failed to get gift cards");
    }
    return parsedResponse;
  }

  public async InitiatePurchase(model: InitiateGiftcardPurchase): Promise<GiftcardPurchaseValidationResponse> {
    const response = await this._requestService.PostRequest("/giftcard/initiate-purchase", model);
    const parsedResponse = this._requestService.TryParseResponse(response);
    if (parsedResponse === undefined) {
      throw new Error("Failed to initiate");
    }

    return parsedResponse;
  }

  public async CompletePurchase(model: Giftcard): Promise<Boolean> {
    const response = await this._requestService.PostRequest("/giftcard/complete-purchase", model);
    const parsedResponse = this._requestService.TryParseResponse(response);
    if (parsedResponse === undefined) {
      throw new Error("Failed to complete");
    }

    return parsedResponse;
  }
}
