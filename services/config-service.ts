import { Config } from '../models'
import $config from '../helpers/configuration'
import { IVuexModule } from '../interfaces'
import { RequestService } from '../services'
export class ConfigService {
  private _requestService: RequestService;
  private _vuexModule: IVuexModule;

  constructor(vuexModule: IVuexModule) {
    this._requestService = new RequestService(vuexModule, $config.okamApiBaseUrl)
    this._vuexModule = vuexModule
  }

  public async Reload(): Promise<Config> {
    const response = await this._requestService.GetRequest("/config");
    const parsedResponse = this._requestService.TryParseResponse(response);
    if (parsedResponse === undefined) {
      throw new Error("Failed to get config");
    }
    this._vuexModule.commit("SetConfig", parsedResponse);
    return parsedResponse;
  }
}
