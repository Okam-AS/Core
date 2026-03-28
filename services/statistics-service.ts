import { ICoreInitializer } from '../interfaces'
import { StatisticOrders, StatisticQueryOrders } from '../models'
import { RequestService } from './request-service'

export class StatisticsService {
    private _requestService: RequestService;

    constructor (coreInitializer: ICoreInitializer) {
      this._requestService = new RequestService(coreInitializer)
    }

    public async Get (model: StatisticQueryOrders): Promise<StatisticOrders> {
      const response = await this._requestService.PostRequest('/statistics', model)
      const parsedResponse = this._requestService.TryParseResponse(response)
      if (parsedResponse === undefined) { throw new Error('Failed to get statistics') }
      return parsedResponse
    }

    public async GetPendingSettlements (model: { StoreId: number, from: string, to: string }): Promise<any> {
      const response = await this._requestService.PostRequest('/statistics/pending-settlements', model)
      const parsedResponse = this._requestService.TryParseResponse(response)
      if (parsedResponse === undefined) { throw new Error('Failed to get pending settlements') }
      return parsedResponse
    }

    public async GetWoltDriveInvoice (model: { StoreId: number, From: string, To: string, AvgMetersPerDelivery: number }): Promise<any> {
      const response = await this._requestService.PostRequest('/statistics/wolt-drive-invoice', model)
      const parsedResponse = this._requestService.TryParseResponse(response)
      if (parsedResponse === undefined) { throw new Error('Failed to get wolt drive invoice') }
      return parsedResponse
    }

    public async GetHeatmapData (model: StatisticQueryOrders): Promise<any> {
      const response = await this._requestService.PostRequest('/statistics/heatmap', model)
      const parsedResponse = this._requestService.TryParseResponse(response)
      if (parsedResponse === undefined) { throw new Error('Failed to get heatmap data') }
      return parsedResponse
    }
}
