import $config from '../helpers/configuration'
import { IVuexModule } from '../interfaces'
import { RequestService } from './request-service'

export class WoltMenuService {
  private _requestService: RequestService

  constructor (vuexModule: IVuexModule) {
    this._requestService = new RequestService(vuexModule, $config.okamApiBaseUrl)
  }

  public async createMenu (storeId: number, request: any): Promise<boolean> {
    const response = await this._requestService.PostRequest(`/wolt/marketplace/stores/${storeId}/menu`, request)
    const parsedResponse = this._requestService.TryParseResponse(response)
    return parsedResponse !== undefined
  }

  public async getMenu (storeId: number): Promise<any> {
    const response = await this._requestService.GetRequest(`/wolt/marketplace/stores/${storeId}/menu`)
    const parsedResponse = this._requestService.TryParseResponse(response)
    if (parsedResponse === undefined) {
      throw new Error('Failed to get Wolt menu')
    }

    return parsedResponse
  }

  public async updateMenuItems (storeId: number, request: any): Promise<boolean> {
    const response = await this._requestService.PatchRequest(`/wolt/marketplace/stores/${storeId}/menu/items`, request)
    const parsedResponse = this._requestService.TryParseResponse(response)
    return parsedResponse !== undefined
  }

  public async updateMenuItemInventory (storeId: number, request: any): Promise<boolean> {
    const response = await this._requestService.PatchRequest(`/wolt/marketplace/stores/${storeId}/menu/items/inventory`, request)
    const parsedResponse = this._requestService.TryParseResponse(response)
    return parsedResponse !== undefined
  }

  public async updateMenuOptions (storeId: number, request: any): Promise<boolean> {
    const response = await this._requestService.PatchRequest(`/wolt/marketplace/stores/${storeId}/menu/options`, request)
    const parsedResponse = this._requestService.TryParseResponse(response)
    return parsedResponse !== undefined
  }
}
