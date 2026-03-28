import $config from "../helpers/configuration";
import { RewardProgram } from "../models";
import { IVuexModule } from "../interfaces";
import { RequestService } from ".";

export class RewardService {
  private _requestService: RequestService;
  private _vuexModule: IVuexModule;

  constructor(vuexModule: IVuexModule) {
    this._requestService = new RequestService(vuexModule, $config.okamApiBaseUrl);
    this._vuexModule = vuexModule;
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

  public async Get(storeId: number) {
    const response = await this._requestService.GetRequest("/rewards/" + storeId);
    const parsedResponse = this._requestService.TryParseResponse(response);
    if (parsedResponse === undefined) {
      throw new Error("Failed to get programs");
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
