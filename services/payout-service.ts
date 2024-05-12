import $config from '../helpers/configuration'
import { Payout } from '../models'
import { IVuexModule } from '../interfaces'
import { RequestService } from '.'

export class PayoutService {
  private _requestService: RequestService;
  private _vuexModule: IVuexModule;

  constructor(vuexModule: IVuexModule) {
    this._requestService = new RequestService(vuexModule, $config.okamApiBaseUrl)
    this._vuexModule = vuexModule
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

  public async CompletePayout(storeId: number) {
    const response = await this._requestService.PostRequest('/payouts/complete/' + storeId)
    return this._requestService.TryParseResponse(response)
  }

  public async SendInvoiceMail(okamPayoutId: number) {
    const response = await this._requestService.PostRequest('/payouts/send-mail/' + okamPayoutId)
    return this._requestService.TryParseResponse(response)
  }

}