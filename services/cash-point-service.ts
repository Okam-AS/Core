import { RequestService } from './request-service';
import { ICoreInitializer } from '../interfaces';
import { CashPoint, CashPointUpsertModel } from '../models';

export class CashPointService {
  private _requestService: RequestService;

  constructor(coreInitializer: ICoreInitializer) {
    this._requestService = new RequestService(coreInitializer);
  }

  public async GetForStore(storeId: number): Promise<Array<CashPoint>> {
    const response = await this._requestService.GetRequest('/CashPoint?storeId=' + encodeURIComponent(storeId));
    const parsed = this._requestService.TryParseResponse(response);
    if (parsed === undefined) {
      throw new Error('Failed to get cash points');
    }
    return parsed;
  }

  public async Get(id: number): Promise<CashPoint> {
    const response = await this._requestService.GetRequest('/CashPoint/' + id);
    const parsed = this._requestService.TryParseResponse(response);
    if (parsed === undefined) {
      throw new Error('Failed to get cash point');
    }
    return parsed;
  }

  public async Create(model: CashPointUpsertModel): Promise<CashPoint> {
    const response = await this._requestService.PostRequest('/CashPoint', model);
    const parsed = this._requestService.TryParseResponse(response);
    if (parsed === undefined) {
      throw new Error('Failed to create cash point');
    }
    return parsed;
  }

  public async Update(id: number, model: CashPointUpsertModel): Promise<CashPoint> {
    const response = await this._requestService.PutRequest('/CashPoint/' + id, model);
    const parsed = this._requestService.TryParseResponse(response);
    if (parsed === undefined) {
      throw new Error('Failed to update cash point');
    }
    return parsed;
  }
}
