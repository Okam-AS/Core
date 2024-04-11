import { ICoreInitializer } from "../interfaces";
import { RequestService } from ".";
import { RewardJoinProgram } from "../models";

export class RewardService {
  private _requestService: RequestService;

  constructor(coreInitializer: ICoreInitializer) {
    this._requestService = new RequestService(coreInitializer);
  }

  public async Get(storeId: number) {
    const response = await this._requestService.GetRequest("/rewards/" + storeId);
    const parsedResponse = this._requestService.TryParseResponse(response);
    if (parsedResponse === undefined) {
      throw new Error("Failed to get programs");
    }

    return parsedResponse;
  }

  public async Join(model: RewardJoinProgram): Promise<Boolean> {
    const response = await this._requestService.PostRequest("/rewards/join", model);
    const parsedResponse = this._requestService.TryParseResponse(response);
    if (parsedResponse === undefined) {
      throw new Error("Failed to join");
    }

    return parsedResponse;
  }
}
