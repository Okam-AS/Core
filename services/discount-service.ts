import $config from '../helpers/configuration'
import { Discount } from '../models'
import { IVuexModule } from '../interfaces'
import { RequestService } from './request-service'

export class DiscountService {
    private _requestService: RequestService;
    private _vuexModule: IVuexModule;
    constructor (vuexModule: IVuexModule) {
      this._requestService = new RequestService(vuexModule, $config.okamApiBaseUrl)
      this._vuexModule = vuexModule
    }

    public async CreateOrUpdate (discount: Discount): Promise<Discount> {
      const response = await this._requestService.PostRequest('/discount', discount)
      return this.ParsedResponse(response, 'Kunne ikke lagre rabatt')
    }

    public async Get (storeId: number): Promise<Array<Discount>> {
      const response = await this._requestService.GetRequest('/discount/store/' + storeId)
      return this.ParsedResponse(response, 'Kunne ikke hente rabatter')
    }

    public async Exists (storeId: Number, discountCode: string): Promise<boolean> {
      const response = await this._requestService.GetRequest('/discount/store/' + storeId + '/' + discountCode)
      const parsedResponse = this._requestService.TryParseResponse(response)
      return parsedResponse === true
    }

    public async Delete (id: string): Promise<void> {
      const response = await this._requestService.DeleteRequest('/discount/' + id)
      if (response.statusCode >= 300 || response.statusCode < 200) { throw new Error('Kunne ikke slettes') }
    }

    private ParsedResponse (response, errorMessage) {
      const parsedResponse = this._requestService.TryParseResponse(response)
      if (parsedResponse === undefined) { throw new Error(errorMessage) }
      return parsedResponse
    }
}
