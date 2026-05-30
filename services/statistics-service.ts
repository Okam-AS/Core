import $config from '../helpers/configuration'
import { IVuexModule } from '../interfaces'
import { StatisticOrders, StatisticQueryOrders } from '../models'
import { RequestService } from './request-service'

export class StatisticsService {
    private _requestService: RequestService;
    private _vuexModule: IVuexModule;

    constructor (vuexModule: IVuexModule) {
      this._requestService = new RequestService(vuexModule, $config.okamApiBaseUrl)
      this._vuexModule = vuexModule
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

    public async GetPlatformGrowth (): Promise<any> {
      const response = await this._requestService.GetRequest('/statistics/platform-growth')
      const parsedResponse = this._requestService.TryParseResponse(response)
      if (parsedResponse === undefined) { throw new Error('Failed to get platform growth') }
      return parsedResponse
    }
}
