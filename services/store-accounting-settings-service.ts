import { RequestService } from './request-service';
import { ICoreInitializer } from '../interfaces';
import { StoreAccountingSettings, UpdateStoreAccountingSettingsModel, EffectiveAccountingSettings } from '../models';

// The store's accounting system and invoice channel (StoreAccountingSettingsController).
export class StoreAccountingSettingsService {
  private _requestService: RequestService;

  constructor(coreInitializer: ICoreInitializer) {
    this._requestService = new RequestService(coreInitializer);
  }

  public async Get(storeId: number): Promise<StoreAccountingSettings> {
    const response = await this._requestService.GetRequest('/stores/' + storeId + '/accounting-settings')
      .catch((error) => error?.response || error);
    const parsed = this._requestService.TryParseResponseWithError(response?.response || response);
    if (parsed.error) { throw new Error(parsed.error || 'Kunne ikke hente regnskapsinnstillinger'); }
    return parsed.data;
  }

  // The resolved view: says whether the accounting system can issue an invoice today, and why not.
  public async GetEffective(storeId: number): Promise<EffectiveAccountingSettings> {
    const response = await this._requestService.GetRequest('/stores/' + storeId + '/accounting-settings/effective')
      .catch((error) => error?.response || error);
    const parsed = this._requestService.TryParseResponseWithError(response?.response || response);
    if (parsed.error) { throw new Error(parsed.error || 'Kunne ikke hente regnskapsinnstillinger'); }
    return parsed.data;
  }

  public async Update(storeId: number, model: UpdateStoreAccountingSettingsModel): Promise<StoreAccountingSettings> {
    const response = await this._requestService.PutRequest('/stores/' + storeId + '/accounting-settings', model)
      .catch((error) => error?.response || error);
    const parsed = this._requestService.TryParseResponseWithError(response?.response || response);
    if (parsed.error) { throw new Error(parsed.error || 'Kunne ikke lagre regnskapsinnstillinger'); }
    return parsed.data;
  }
}
