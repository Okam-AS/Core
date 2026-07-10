import { RequestService } from './request-service';
import { ICoreInitializer } from '../interfaces';
import { Allergen, AllergenUpsertModel } from '../models';

export class AllergenService {
  private _requestService: RequestService;

  constructor(coreInitializer: ICoreInitializer) {
    this._requestService = new RequestService(coreInitializer);
  }

  public async GetForStore(storeId: number): Promise<Array<Allergen>> {
    const response = await this._requestService.GetRequest('/Allergen?storeId=' + encodeURIComponent(storeId));
    const parsed = this._requestService.TryParseResponse(response);
    if (parsed === undefined) {
      throw new Error('Failed to get allergens');
    }
    return parsed;
  }

  public async Get(id: number): Promise<Allergen> {
    const response = await this._requestService.GetRequest('/Allergen/' + id);
    const parsed = this._requestService.TryParseResponse(response);
    if (parsed === undefined) {
      throw new Error('Failed to get allergen');
    }
    return parsed;
  }

  public async Create(model: AllergenUpsertModel): Promise<Allergen> {
    const response = await this._requestService.PostRequest('/Allergen', model);
    const parsed = this._requestService.TryParseResponse(response);
    if (parsed === undefined) {
      throw new Error('Failed to create allergen');
    }
    return parsed;
  }

  public async Update(id: number, model: AllergenUpsertModel): Promise<Allergen> {
    const response = await this._requestService.PutRequest('/Allergen/' + id, model);
    const parsed = this._requestService.TryParseResponse(response);
    if (parsed === undefined) {
      throw new Error('Failed to update allergen');
    }
    return parsed;
  }

  public async Delete(id: number): Promise<boolean> {
    const response = await this._requestService.DeleteRequest('/Allergen/' + id);
    return this._requestService.TryParseResponse(response) !== undefined;
  }

  public async SeedStandard(storeId: number): Promise<Array<Allergen>> {
    const response = await this._requestService.PostRequest('/Allergen/seed-standard/' + storeId);
    const parsed = this._requestService.TryParseResponse(response);
    if (parsed === undefined) {
      throw new Error('Failed to seed standard allergens');
    }
    return parsed;
  }
}
