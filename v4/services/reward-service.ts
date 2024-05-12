import { ICoreInitializer } from "../interfaces";
import { RequestService } from ".";
import { RewardJoinProgram, RewardProgram } from "../models";

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

  public async GetDetailed(rewardProgramId: string): Promise<RewardProgram> {
    const response = await this._requestService.GetRequest("/rewards/" + rewardProgramId + "/details");
    const parsedResponse = this._requestService.TryParseResponse(response);
    if (parsedResponse === undefined) {
      throw new Error("Failed to get program");
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

  public async CancelMembership(rewardProgramId: string): Promise<Boolean> {
    const response = await this._requestService.DeleteRequest("/rewards/" + rewardProgramId);
    const parsedResponse = this._requestService.TryParseResponse(response);
    if (parsedResponse === undefined) {
      throw new Error("Failed to cancel membership");
    }

    return parsedResponse;
  }
}
