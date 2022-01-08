import $config from '../helpers/configuration'
import { Product, Culture } from '../models'
import { IVuexModule } from '../interfaces'
import { RequestService } from '.'

export class CultureService {
    private _requestService: RequestService;

    constructor (vuexModule: IVuexModule) {
      this._requestService = new RequestService(vuexModule, $config.okamApiBaseUrl)
    }

    public async GetByCode (code: string): Promise<Culture> {
      const response = await this._requestService.GetRequest('/culture/' + code)
      return this.ParsedResponse(response, 'Kunne ikke hente språk')
    }

    public async GetAll (): Promise<Array<Culture>> {
      const response = await this._requestService.GetRequest('/culture')
      return this.ParsedResponse(response, 'Kunne ikke hente språk')
    }

    public async CreateOrUpdateTranslations (cultures: Array<Culture>): Promise<Product> {
      const response = await this._requestService.PostRequest('/culture/translations', cultures)
      return this.ParsedResponse(response, 'Kunne ikke lagre språk')
    }

    public async Create (code: string): Promise<Product> {
      const response = await this._requestService.PostRequest('/culture/translations/' + code)
      return this.ParsedResponse(response, 'Kunne ikke opprette språk')
    }

    public async Delete (translationKey: string): Promise<void> {
      const response = await this._requestService.DeleteRequest('/culture/' + translationKey)
      if (response.statusCode >= 300 || response.statusCode < 200) { throw new Error('Kunne ikke slette oversettelse') }
    }

    private ParsedResponse (response, errorMessage) {
      const parsedResponse = this._requestService.TryParseResponse(response)
      if (parsedResponse === undefined) { throw new Error(errorMessage) }
      return parsedResponse
    }
}