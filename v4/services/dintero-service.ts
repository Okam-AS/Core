import { RequestService } from "./request-service";
import { ICoreInitializer } from "../interfaces";
import { DinteroInitResponse, DinteroInitiatePaymentModel } from "../models";

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
}
