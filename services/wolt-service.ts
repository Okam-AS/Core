import $config from '../helpers/configuration'
import { IVuexModule } from '../interfaces'
import { RequestService } from './request-service'

export class WoltService {
   private _requestService: RequestService

   constructor (vuexModule: IVuexModule) {
     this._requestService = new RequestService(vuexModule, $config.okamApiBaseUrl)
   }

   public async getOrders (page: number = 1, pageSize: number = 20): Promise<{orders: any[], totalCount: number, page: number, pageSize: number, totalPages: number}> {
     const response = await this._requestService.GetRequest(`/wolt/orders?page=${page}&pageSize=${pageSize}`)
     const parsedResponse = this._requestService.TryParseResponse(response)
     if (parsedResponse === undefined) {
       throw new Error('Failed to get Wolt orders')
     }

     return parsedResponse
   }
}