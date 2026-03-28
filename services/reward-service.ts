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

  public async SendReward(storeId: number, userId: number, amount: number) {
    const response = await this._requestService.PostRequest("/rewards/send", { storeId, userId, amount });
    const parsedResponse = this._requestService.TryParseResponse(response);
    if (parsedResponse === undefined) {
      throw new Error("Failed to send reward");
    }
    return parsedResponse;
  }

  public async GetRewardCards(storeId: number, userId: number) {
    const response = await this._requestService.GetRequest("/rewards/members/" + storeId + "/" + userId);
    const parsedResponse = this._requestService.TryParseResponse(response);
    if (parsedResponse === undefined) {
      throw new Error("Failed to get reward cards");
    }
    return parsedResponse;
  }

  public async GetMembers(storeId: number) {
    const response = await this._requestService.GetRequest("/rewards/members/" + storeId + "/summaries");
    const parsedResponse = this._requestService.TryParseResponse(response);
    if (parsedResponse === undefined) {
      throw new Error("Failed to get members");
    }
    return parsedResponse;
  }

  public async GetStats(storeId: number) {
    const response = await this._requestService.GetRequest("/rewards/members/" + storeId + "/stats");
    const parsedResponse = this._requestService.TryParseResponse(response);
    if (parsedResponse === undefined) {
      throw new Error("Failed to get reward stats");
    }
    return parsedResponse;
  }

  public async Init(storeId: number) {
    const response = await this._requestService.PostRequest("/rewards/" + storeId + "/init");
    return this._requestService.TryParseResponse(response);
  }

  public async Link(storeId: number, rewardProgramId: string) {
    const response = await this._requestService.PostRequest("/rewards/" + storeId + "/link/" + rewardProgramId);
    return this._requestService.TryParseResponse(response);
  }

  public async Update(storeId: number, model: RewardProgram): Promise<boolean> {
    const response = await this._requestService.PutRequest("/rewards/" + storeId + "/update", model);
    const parsedResponse = this._requestService.TryParseResponse(response);
    return parsedResponse !== undefined;
  }

  public async Remove(storeId: number): Promise<boolean> {
    const response = await this._requestService.PutRequest("/rewards/" + storeId + "/update", { removeStore: true });
    const parsedResponse = this._requestService.TryParseResponse(response);
    return parsedResponse !== undefined;
  }
}
