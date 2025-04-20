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

  public async Verify(sessionId: string): Promise<DinteroVerifyResponse> {
    const response = await this._requestService.GetRequest("/dintero/verify/" + sessionId);
    const parsedResponse = this._requestService.TryParseResponse(response);
    if (parsedResponse === undefined) {
      throw new Error("Kunne ikke verifisere Dintero-betaling");
    }
    return parsedResponse;
  }

  public PullVerifyResult(sessionId, successHandler, failHandler) {
    let intervalId;
    const poll = () => {
      this.Verify(sessionId)
        .then((result) => {
          if (result.status === "Success") {
            clearInterval(intervalId);
            if (successHandler) successHandler(result);
          } else if (result.status === "Fail") {
            clearInterval(intervalId);
            if (failHandler) failHandler(result);
          }
        })
        .catch((e) => {
          clearInterval(intervalId);
          failHandler();
        });
    };

    setTimeout(() => {
      this.Verify(sessionId)
        .then((result) => {
          if (result.status === "Success") {
            if (successHandler) successHandler(result);
          } else if (result.status === "Fail") {
            if (failHandler) failHandler(result);
          } else {
            // Only start polling if still waiting
            intervalId = setInterval(poll, 1800);
          }
        })
        .catch((e) => {
          failHandler();
        });
    }, 800);

  }
}
