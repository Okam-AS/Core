import { Payout } from '../models'
import { ICoreInitializer } from '../interfaces'
import { RequestService } from '.'

export class PayoutService {
  private _requestService: RequestService;

  constructor(coreInitializer: ICoreInitializer) {
    this._requestService = new RequestService(coreInitializer)
  }

  public async GetAwaiting(storeId: number): Promise<Payout> {
    const response = await this._requestService.GetRequest('/payouts/awaiting/' + storeId)
    const parsedResponse = this._requestService.TryParseResponse(response)
    if (parsedResponse === undefined) { throw new Error('Failed to get awaiting payout') }
    return parsedResponse as Payout;
  }

  public async GetLatest(): Promise<Payout[]> {
    const response = await this._requestService.GetRequest('/payouts/latest')
    const parsedResponse = this._requestService.TryParseResponse(response)
    if (parsedResponse === undefined) { throw new Error('Failed to get latest payouts') }
    return parsedResponse as Payout[];
  }

  public async RequestPayout(storeId: number) {
    const response = await this._requestService.PostRequest('/payouts/request/' + storeId)
    return this._requestService.TryParseResponse(response)
  }

  public async CancelRequestPayout(storeId: number) {
    const response = await this._requestService.DeleteRequest('/payouts/request/' + storeId)
    return this._requestService.TryParseResponse(response)
  }

  public async CompletePayout(storeId: number) {
    const response = await this._requestService.PostRequest('/payouts/complete/' + storeId)
    return this._requestService.TryParseResponse(response)
  }

  public async SendInvoiceMail(okamPayoutId: number) {
    const response = await this._requestService.PostRequest('/payouts/send-mail/' + okamPayoutId)
    return this._requestService.TryParseResponse(response)
  }
}
