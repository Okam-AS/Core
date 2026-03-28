import $config from '../helpers/configuration';
import { IVuexModule } from '../interfaces';
import { RequestService } from './request-service';

export class DinteroService {
  private _requestService: RequestService;

  constructor(vuexModule: IVuexModule) {
    this._requestService = new RequestService(vuexModule, $config.okamApiBaseUrl);
  }

  public async getSellers(): Promise<any[]> {
    const response = await this._requestService.GetRequest('/dintero/sellers');
    const parsedResponse = this._requestService.TryParseResponse(response);
    if (parsedResponse === undefined) {
      throw new Error('Failed to get sellers');
    }

    return parsedResponse;
  }

  public async deleteSeller(id: number, forceDelete: boolean): Promise<boolean> {
    const response = await this._requestService.DeleteRequest('/dintero/sellers/' + id + (forceDelete ? '?forceDelete=true' : ''));
    const parsedResponse = this._requestService.TryParseResponse(response);
    if (parsedResponse === undefined) {
      throw new Error('Failed to delete seller');
    }

    return parsedResponse;
  }

  public async createSeller(payload: any): Promise<any> {
    const response = await this._requestService.PostRequest('/dintero/sellers', payload);
    const parsedResponse = this._requestService.TryParseResponse(response);
    if (parsedResponse === undefined) {
      throw new Error('Failed to create seller');
    }
    return parsedResponse;
  }
}