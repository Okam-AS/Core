import { RequestService } from './request-service';
import { ICoreInitializer } from '../interfaces';
import { DiscountReason, DiscountReasonUpsertModel } from '../models';

export class DiscountReasonService {
  private _requestService: RequestService;

  constructor(coreInitializer: ICoreInitializer) {
    this._requestService = new RequestService(coreInitializer);
  }

  public async GetForStore(storeId: number): Promise<Array<DiscountReason>> {
    const response = await this._requestService.GetRequest('/DiscountReason?storeId=' + encodeURIComponent(storeId));
    const parsed = this._requestService.TryParseResponse(response);
    if (parsed === undefined) {
      throw new Error('Failed to get discount reasons');
    }
    return parsed;
  }

  public async Get(id: number): Promise<DiscountReason> {
    const response = await this._requestService.GetRequest('/DiscountReason/' + id);
    const parsed = this._requestService.TryParseResponse(response);
    if (parsed === undefined) {
      throw new Error('Failed to get discount reason');
    }
    return parsed;
  }

  public async Create(model: DiscountReasonUpsertModel): Promise<DiscountReason> {
    const response = await this._requestService.PostRequest('/DiscountReason', model);
    const parsed = this._requestService.TryParseResponse(response);
    if (parsed === undefined) {
      throw new Error('Failed to create discount reason');
    }
    return parsed;
  }

  public async Update(id: number, model: DiscountReasonUpsertModel): Promise<DiscountReason> {
    const response = await this._requestService.PutRequest('/DiscountReason/' + id, model);
    const parsed = this._requestService.TryParseResponse(response);
    if (parsed === undefined) {
      throw new Error('Failed to update discount reason');
    }
    return parsed;
  }

  public async Delete(id: number): Promise<boolean> {
    const response = await this._requestService.DeleteRequest('/DiscountReason/' + id);
    return this._requestService.TryParseResponse(response) !== undefined;
  }
}
