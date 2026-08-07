import { ICoreInitializer } from '../interfaces'
import { StatisticOrders, StatisticQueryOrders } from '../models'
import { RequestService } from './request-service'

// Every read in this file used to throw a `new Error(<an English sentence written here>)` and
// nothing else. Two things were wrong with that, and they were wrong in two DIFFERENT ways
// depending on the verb:
//
//   POST reads (`Get`, `GetPendingSettlements`, `GetWoltDriveInvoice`, `GetHeatmapData`)
//     `PostRequest` already resolves a transport rejection into the error object, so these DID
//     reach their own `throw` — and threw away the reason the backend had written in the body,
//     replacing it with a fixed English string, on every 401, 403, 500 and offline read alike.
//
//   the GET read (`GetPlatformGrowth`)
//     `GetRequest` does NOT catch, so on any non-2xx the axios rejection left this file before the
//     `throw` was ever reached and the caller got axios's own "Request failed with status code
//     401". Which means the sentence written on that line HAD NEVER ONCE RUN on web: reaching it
//     needs a RESOLVED non-2xx, and axios only resolves 2xx. It is not preserved here as though it
//     worked — the read below is switched to `SafeGetRequest`, which resolves the rejection, and
//     that is what gives the line a first real job: the last-resort text for a failure whose body
//     carried no reason. (On NativeScript it was always live, because that http stack resolves
//     every status; the two platforms had silently diverged.)
//
// In both cases `statusCode` was undefined on the thrown error, so no caller could tell an expired
// session from a refusal from a crashed report engine from being offline. `BuildError` exists for
// exactly this and its own comment says so; it prefers the backend's reason, attaches the status,
// and now records which of the two the message is.
export class StatisticsService {
    private _requestService: RequestService;

    constructor (coreInitializer: ICoreInitializer) {
      this._requestService = new RequestService(coreInitializer)
    }

    public async Get (model: StatisticQueryOrders): Promise<StatisticOrders> {
      const response = await this._requestService.PostRequest('/statistics', model)
      const parsedResponse = this._requestService.TryParseResponse(response)
      if (parsedResponse === undefined) { throw this._requestService.BuildError('Failed to get statistics', response) }
      return parsedResponse
    }

    public async GetPendingSettlements (model: { StoreId: number, from: string, to: string }): Promise<any> {
      const response = await this._requestService.PostRequest('/statistics/pending-settlements', model)
      const parsedResponse = this._requestService.TryParseResponse(response)
      if (parsedResponse === undefined) { throw this._requestService.BuildError('Failed to get pending settlements', response) }
      return parsedResponse
    }

    public async GetWoltDriveInvoice (model: { StoreId: number, From: string, To: string, AvgMetersPerDelivery: number }): Promise<any> {
      const response = await this._requestService.PostRequest('/statistics/wolt-drive-invoice', model)
      const parsedResponse = this._requestService.TryParseResponse(response)
      if (parsedResponse === undefined) { throw this._requestService.BuildError('Failed to get wolt drive invoice', response) }
      return parsedResponse
    }

    public async GetHeatmapData (model: StatisticQueryOrders): Promise<any> {
      const response = await this._requestService.PostRequest('/statistics/heatmap', model)
      const parsedResponse = this._requestService.TryParseResponse(response)
      if (parsedResponse === undefined) { throw this._requestService.BuildError('Failed to get heatmap data', response) }
      return parsedResponse
    }

    public async GetPlatformGrowth (): Promise<any> {
      const response = await this._requestService.SafeGetRequest('/statistics/platform-growth')
      const parsedResponse = this._requestService.TryParseResponse(response)
      if (parsedResponse === undefined) { throw this._requestService.BuildError('Failed to get platform growth', response) }
      return parsedResponse
    }
}
