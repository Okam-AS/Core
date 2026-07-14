import { RequestService } from './request-service';
import { ICoreInitializer } from '../interfaces';
import { GoodsGroup, GoodsGroupUpsertModel } from '../models';

export class GoodsGroupService {
  private _requestService: RequestService;

  constructor(coreInitializer: ICoreInitializer) {
    this._requestService = new RequestService(coreInitializer);
  }

  public async GetForStore(storeId: number): Promise<Array<GoodsGroup>> {
    const response = await this._requestService.GetRequest('/GoodsGroup?storeId=' + encodeURIComponent(storeId));
    const parsed = this._requestService.TryParseResponse(response);
    if (parsed === undefined) {
      throw new Error('Failed to get goods groups');
    }
    return parsed;
  }

  public async Get(id: number): Promise<GoodsGroup> {
    const response = await this._requestService.GetRequest('/GoodsGroup/' + id);
    const parsed = this._requestService.TryParseResponse(response);
    if (parsed === undefined) {
      throw new Error('Failed to get goods group');
    }
    return parsed;
  }

  public async Create(model: GoodsGroupUpsertModel): Promise<GoodsGroup> {
    const response = await this._requestService.PostRequest('/GoodsGroup', model);
    const parsed = this._requestService.TryParseResponse(response);
    if (parsed === undefined) {
      throw new Error('Failed to create goods group');
    }
    return parsed;
  }

  public async Update(id: number, model: GoodsGroupUpsertModel): Promise<GoodsGroup> {
    const response = await this._requestService.PutRequest('/GoodsGroup/' + id, model);
    const parsed = this._requestService.TryParseResponse(response);
    if (parsed === undefined) {
      throw new Error('Failed to update goods group');
    }
    return parsed;
  }

  public async Delete(id: number): Promise<boolean> {
    const response = await this._requestService.DeleteRequest('/GoodsGroup/' + id);
    return this._requestService.TryParseResponse(response) !== undefined;
  }

  // Seeds the Norway default goods groups (with VAT profiles) into a store, skipping codes it
  // already has. Idempotent; used to onboard a store created before the defaults existed.
  public async SeedStandard(storeId: number): Promise<Array<GoodsGroup>> {
    const response = await this._requestService.PostRequest('/GoodsGroup/seed-standard/' + storeId, {});
    const parsed = this._requestService.TryParseResponse(response);
    if (parsed === undefined) {
      throw new Error('Failed to seed standard goods groups');
    }
    return parsed;
  }

  // Rollout backfill: seeds the default groups into every store (PowerUser). Idempotent; returns how
  // many stores gained groups.
  public async BackfillAll(): Promise<{ seededStores: number }> {
    const response = await this._requestService.PostRequest('/GoodsGroup/backfill-all', {});
    const parsed = this._requestService.TryParseResponse(response);
    if (parsed === undefined) {
      throw new Error('Failed to backfill goods groups');
    }
    return parsed;
  }
}
