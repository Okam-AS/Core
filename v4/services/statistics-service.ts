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
}