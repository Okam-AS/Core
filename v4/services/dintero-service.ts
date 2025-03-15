import { RequestService } from "./request-service";
import { ICoreInitializer } from "../interfaces";
import { DinteroInitResponse } from "../models";

export class DinteroService {
  private _requestService: RequestService;

  constructor(coreInitializer: ICoreInitializer) {
    this._requestService = new RequestService(coreInitializer);
  }

  public async Initiate(storeId: number, isApp: boolean): Promise<DinteroInitResponse> {
    const response = await this._requestService.PostRequest("/dintero/initiate", {
      storeId,
      isApp,
    });

    const parsedResponse = this._requestService.TryParseResponse(response);

    if (parsedResponse === undefined) {
      throw new Error("Invalid response from Dintero service");
    }

    return parsedResponse;
  }
}
