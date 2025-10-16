import $config from '../helpers/configuration'
import { IVuexModule } from '../interfaces'
import { RequestService } from './request-service'

export class WoltVenueService {
  private _requestService: RequestService

  constructor (vuexModule: IVuexModule) {
    this._requestService = new RequestService(vuexModule, $config.okamApiBaseUrl)
  }

  public async getVenueStatus (storeId: number): Promise<any> {
    const response = await this._requestService.GetRequest(`/wolt/marketplace/stores/${storeId}/venue/status`)
    const parsedResponse = this._requestService.TryParseResponse(response)
    if (parsedResponse === undefined) {
      throw new Error('Failed to get Wolt venue status')
    }

    return parsedResponse
  }

  public async updateVenueOnlineStatus (storeId: number, request: any): Promise<boolean> {
    const response = await this._requestService.PatchRequest(`/wolt/marketplace/stores/${storeId}/venue/online`, request)
    const parsedResponse = this._requestService.TryParseResponse(response)
    return parsedResponse !== undefined
  }

  public async updateVenueOpeningTimes (storeId: number, request: any): Promise<boolean> {
    const response = await this._requestService.PatchRequest(`/wolt/marketplace/stores/${storeId}/venue/opening-times`, request)
    const parsedResponse = this._requestService.TryParseResponse(response)
    return parsedResponse !== undefined
  }

  public async getCurrentDeliveryProvider (storeId: number): Promise<any> {
    const response = await this._requestService.GetRequest(`/wolt/marketplace/stores/${storeId}/venue/delivery-provider`)
    const parsedResponse = this._requestService.TryParseResponse(response)
    if (parsedResponse === undefined) {
      throw new Error('Failed to get current delivery provider')
    }

    return parsedResponse
  }

  public async changeDeliveryProvider (storeId: number, request: any): Promise<boolean> {
    const response = await this._requestService.PatchRequest(`/wolt/marketplace/stores/${storeId}/venue/delivery-provider`, request)
    const parsedResponse = this._requestService.TryParseResponse(response)
    return parsedResponse !== undefined
  }
}
