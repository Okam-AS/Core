import $config from '../helpers/configuration'
import { DeliveryMethod } from '../models'
import { IVuexModule } from '../interfaces'
import { RequestService } from './request-service'

export class DeliveryMethodService {
    private _requestService: RequestService;
    private _vuexModule: IVuexModule;

    constructor (vuexModule: IVuexModule) {
      this._requestService = new RequestService(vuexModule, $config.okamApiBaseUrl)
      this._vuexModule = vuexModule
    }

    public async Get (storeId: number): Promise<Array<DeliveryMethod>> {
      const response = await this._requestService.GetRequest('/deliverymethods/' + storeId)
      const parsedResponse = this._requestService.TryParseResponse(response)
      if (parsedResponse === undefined) { throw new Error('Failed to get delivery methods') }

      return parsedResponse
    }

    public async Create (deliveryMethod: DeliveryMethod): Promise<DeliveryMethod> {
      const response = await this._requestService.PostRequest('/deliverymethods', deliveryMethod)
      const parsedResponse = this._requestService.TryParseResponse(response)
      if (parsedResponse === undefined) { throw new Error('Kunne ikke opprette fraktregel') }
      return parsedResponse
    }

    public async Update (deliveryMethod: DeliveryMethod): Promise<DeliveryMethod> {
      const response = await this._requestService.PutRequest('/deliverymethods', deliveryMethod)
      const parsedResponse = this._requestService.TryParseResponse(response)
      if (parsedResponse === undefined) { throw new Error('Kunne ikke lagre fraktregel') }

      return parsedResponse
    }

    public async Delete (id: string): Promise<void> {
      const response = await this._requestService.DeleteRequest('/deliverymethods/' + id)
      if (response.statusCode >= 300 || response.statusCode < 200) { throw new Error('Kunne ikke slettes') }
    }

    public async GetHomeDeliveryMethod (storeId: number, from: string, to: string): Promise<DeliveryMethod> {
      const response = await this._requestService.PostRequest('/deliverymethods/homedeliverymethod', {
        storeId,
        from,
        to
      })
      const parsedResponse = this._requestService.TryParseResponse(response)
      if (parsedResponse === undefined) { throw new Error('Failed to get delivery method') }

      return parsedResponse
    }
}