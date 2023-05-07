import { Order } from '../models'
import { OrderStatus } from '../enums'
import { ICoreInitializer } from '../interfaces'
import { RequestService } from './request-service'

export class OrderService {
    private _requestService: RequestService;

    constructor (coreInitializer: ICoreInitializer) {
      this._requestService = new RequestService(coreInitializer)
    }

    public async GetAll (): Promise<Array<Order>> {
      const response = await this._requestService.GetRequest('/orders')
      const parsedResponse = this._requestService.TryParseResponse(response)
      if (parsedResponse === undefined) { throw new Error('Failed to get orders') }

      return parsedResponse
    }

    public async GetOngoing (storeId: number): Promise<Array<Order>> {
      const response = await this._requestService.GetRequest('/orders/ongoing/'+storeId)
      const parsedResponse = this._requestService.TryParseResponse(response)
      if (parsedResponse === undefined) { throw new Error('Failed to get orders') }

      return parsedResponse
    }

    public async GetAllOngoing (): Promise<Array<Order>> {
      const response = await this._requestService.GetRequest('/orders/ongoing')
      const parsedResponse = this._requestService.TryParseResponse(response)
      if (parsedResponse === undefined) { throw new Error('Failed to get orders') }

      return parsedResponse
    }

    public async UpdateStatus (orderId: string, status: OrderStatus): Promise<Order> {
      const response = await this._requestService.PutRequest('/orders/update/', { id: orderId, status })
      const parsedResponse = this._requestService.TryParseResponse(response)
      if (parsedResponse === undefined) { throw new Error('Failed to update orderstatus') }

      return parsedResponse
    }

    public async GetStoresOrders (storeId: number, partially: boolean): Promise<Array<Order>> {
      const response = await this._requestService.GetRequest('/orders/store/' + storeId + '?partially=' + (partially === true))
      const parsedResponse = this._requestService.TryParseResponse(response)
      if (parsedResponse === undefined) { throw new Error('Failed to get orders') }
      return parsedResponse
    }

    public async Processing (orderId: string, remainingMinutes: number): Promise<Order> {
      const response = await this._requestService.PutRequest('/orders/processing/', { id: orderId, remainingMinutes })
      const parsedResponse = this._requestService.TryParseResponse(response)
      if (parsedResponse === undefined) { throw new Error('Failed to update orderstatus') }

      return parsedResponse
    }

}