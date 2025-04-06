import { RequestService } from "./request-service";
import { ICoreInitializer } from "../interfaces";
import { DinteroInitResponse, DinteroInitiatePaymentModel, DinteroVerifyResponse } from "../models";

export class DinteroService {
  private _requestService: RequestService;

  constructor(coreInitializer: ICoreInitializer) {
    this._requestService = new RequestService(coreInitializer);
  }

  public async Initiate(model: DinteroInitiatePaymentModel): Promise<DinteroInitResponse> {
    const response = await this._requestService.PostRequest("/dintero/initiate", model);

    const parsedResponse = this._requestService.TryParseResponse(response);

    if (parsedResponse === undefined) {
      throw new Error("Invalid response from Dintero service");
    }

    return parsedResponse;
  }

  public async Verify(transactionId: string): Promise<DinteroVerifyResponse> {
    const response = await this._requestService.GetRequest("/dintero/verify/" + transactionId);
    const parsedResponse = this._requestService.TryParseResponse(response);
    if (parsedResponse === undefined) {
      throw new Error("Kunne ikke verifisere Dintero-betaling");
    }
    return parsedResponse;
  }

  public PullVerifyResult = (transactionId: string, successHandler, failHandler) => {
    if (!transactionId && failHandler) {
      failHandler();
    }
    if (!transactionId) {
      return;
    }
    setTimeout(() => {
      const intervalId = setInterval(() => {
        this.Verify(transactionId)
          .then((result) => {
            // result.status: 'Waiting', 'Success', or 'Fail'
            if (result.status === "Success") {
              clearInterval(intervalId);
              if (successHandler) {
                successHandler(result);
              }
            } else if (result.status === "Fail") {
              clearInterval(intervalId);
              if (failHandler) {
                failHandler(result);
              }
            }
          })
          .catch(() => {
            clearInterval(intervalId);
            failHandler();
          });
      }, 2000);
    }, 2200);
  };
}
