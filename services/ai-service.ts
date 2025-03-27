import { IVuexModule } from '../interfaces'
import $config from '../helpers/configuration'
import { RequestService, UserService } from '../services'

export class AIService {
  private _requestService: RequestService;
  private _userService: UserService;
  private _vuexModule: IVuexModule;

  constructor(vuexModule: IVuexModule) {
    this._requestService = new RequestService(vuexModule, $config.okamApiBaseUrl)
    this._vuexModule = vuexModule
    this._userService = new UserService(vuexModule)
  }

  public async MenuToJson(storeId: number, pageContent: string, extraInstructions: string): Promise<any> {
    const payload = {
      PageContent: pageContent,
      StoreId: storeId.toString(),
      ExtraInstructions: extraInstructions
    }

    const response = await this._requestService.PostRequest('/ai/menu-to-json', payload)
    return this.ParsedResponse(response, 'Kunne ikke konvertere meny til JSON')
  }

  private ParsedResponse(response: any, errorMessage: string): any {
    const parsedResponse = this._requestService.TryParseResponse(response)
    if (parsedResponse === undefined) { throw new Error(errorMessage) }
    return parsedResponse
  }
}
