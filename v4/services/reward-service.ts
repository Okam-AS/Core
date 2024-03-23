import { ICoreInitializer } from '../interfaces'
import { RequestService } from '.'
import { RewardJoinProgram, RewardPurchase, InitiatePurchaseReward, RewardPurchaseValidationResponse } from '../models'

export class RewardService {

  private _requestService: RequestService;

  constructor(coreInitializer: ICoreInitializer) {
    this._requestService = new RequestService(coreInitializer)
  }

  public async Get(storeId: number) {
    const response = await this._requestService.GetRequest('/rewards/' + storeId)
    const parsedResponse = this._requestService.TryParseResponse(response)
    if (parsedResponse === undefined) { throw new Error('Failed to get programs') }

    return parsedResponse
  }

  public async Join(model: RewardJoinProgram): Promise<Boolean> {
    const response = await this._requestService.PostRequest('/rewards/join', model)
    const parsedResponse = this._requestService.TryParseResponse(response)
    if (parsedResponse === undefined) { throw new Error('Failed to join') }

    return parsedResponse
  }

  public async InitiatePurchase(model: InitiatePurchaseReward): Promise<RewardPurchaseValidationResponse> {
    const response = await this._requestService.PostRequest('/rewards/purchase/initiate', model)
    const parsedResponse = this._requestService.TryParseResponse(response)
    if (parsedResponse === undefined) { throw new Error('Failed to initiate') }

    return parsedResponse
  }

  public async CompletePurchase(model: RewardPurchase): Promise<Boolean> {
    const response = await this._requestService.PostRequest('/rewards/purchase/complete', model)
    const parsedResponse = this._requestService.TryParseResponse(response)
    if (parsedResponse === undefined) { throw new Error('Failed to complete') }

    return parsedResponse
  }

}