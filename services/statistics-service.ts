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
}