import { RequestService } from './request-service';
import { ICoreInitializer } from '../interfaces';
import { OpenPricePreset, OpenPricePresetUpsertModel } from '../models';

// CRUD for the store's open-price presets (WP-A2). The POS reads them through GetForStore.
export class OpenPricePresetService {
  private _requestService: RequestService;

  constructor(coreInitializer: ICoreInitializer) {
    this._requestService = new RequestService(coreInitializer);
  }

  public async GetForStore(storeId: number): Promise<Array<OpenPricePreset>> {
    const response = await this._requestService.GetRequest('/OpenPricePreset?storeId=' + encodeURIComponent(storeId));
    const parsed = this._requestService.TryParseResponse(response);
    if (parsed === undefined) {
      throw new Error('Failed to get open-price presets');
    }
    return parsed;
  }

  public async Get(id: number): Promise<OpenPricePreset> {
    const response = await this._requestService.GetRequest('/OpenPricePreset/' + id);
    const parsed = this._requestService.TryParseResponse(response);
    if (parsed === undefined) {
      throw new Error('Failed to get open-price preset');
    }
    return parsed;
  }

  public async Create(model: OpenPricePresetUpsertModel): Promise<OpenPricePreset> {
    const response = await this._requestService.PostRequest('/OpenPricePreset', model);
    const parsed = this._requestService.TryParseResponse(response);
    if (parsed === undefined) {
      throw new Error('Failed to create open-price preset');
    }
    return parsed;
  }

  public async Update(id: number, model: OpenPricePresetUpsertModel): Promise<OpenPricePreset> {
    const response = await this._requestService.PutRequest('/OpenPricePreset/' + id, model);
    const parsed = this._requestService.TryParseResponse(response);
    if (parsed === undefined) {
      throw new Error('Failed to update open-price preset');
    }
    return parsed;
  }

  public async Delete(id: number): Promise<boolean> {
    const response = await this._requestService.DeleteRequest('/OpenPricePreset/' + id);
    return this._requestService.TryParseResponse(response) !== undefined;
  }
}
