import $config from '../helpers/configuration'
import { IVuexModule } from '../interfaces'
import { RequestService } from './request-service'

export class WoltMenuService {
  private _requestService: RequestService

  constructor (vuexModule: IVuexModule) {
    this._requestService = new RequestService(vuexModule, $config.okamApiBaseUrl)
  }

  public async createMenu (storeId: number, request: any): Promise<boolean> {
    const response = await this._requestService.PostRequest(`/wolt/menu/stores/${storeId}`, request)
    const parsedResponse = this._requestService.TryParseResponse(response)
    return parsedResponse !== undefined
  }

  public async getMenu (storeId: number): Promise<any> {
    const response = await this._requestService.GetRequest(`/wolt/menu/stores/${storeId}`)
    const result = this._requestService.TryParseResponseWithError(response)

    if (result.error) {
      throw new Error(result.error)
    }

    return result.data
  }

  public async updateMenuItems (storeId: number, request: any): Promise<boolean> {
    const response = await this._requestService.PatchRequest(`/wolt/menu/stores/${storeId}/items`, request)
    const parsedResponse = this._requestService.TryParseResponse(response)
    return parsedResponse !== undefined
  }

  public async updateMenuItemInventory (storeId: number, request: any): Promise<boolean> {
    const response = await this._requestService.PatchRequest(`/wolt/menu/stores/${storeId}/items/inventory`, request)
    const parsedResponse = this._requestService.TryParseResponse(response)
    return parsedResponse !== undefined
  }

  public async updateMenuOptions (storeId: number, request: any): Promise<boolean> {
    const response = await this._requestService.PatchRequest(`/wolt/menu/stores/${storeId}/options`, request)
    const parsedResponse = this._requestService.TryParseResponse(response)
    return parsedResponse !== undefined
  }

  public async importMenu (storeId: number): Promise<boolean> {
    const response = await this._requestService.PostRequest(`/wolt/menu/stores/${storeId}/import`, {})
    const parsedResponse = this._requestService.TryParseResponse(response)
    return parsedResponse !== undefined
  }

  public async syncMenu (storeId: number): Promise<boolean> {
    const response = await this._requestService.PostRequest(`/wolt/menu/stores/${storeId}/sync`, {})
    const parsedResponse = this._requestService.TryParseResponse(response)
    return parsedResponse !== undefined
  }

  public async deleteMenu (storeId: number): Promise<boolean> {
    const response = await this._requestService.DeleteRequest(`/wolt/menu/stores/${storeId}`)
    const parsedResponse = this._requestService.TryParseResponse(response)
    return parsedResponse !== undefined
  }
}
