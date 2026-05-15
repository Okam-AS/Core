import $config from '../helpers/configuration'
import { IVuexModule } from '../interfaces'
import { RequestService } from './request-service'

export class KraviaInvoiceService {
  private _requestService: RequestService

  constructor(vuexModule: IVuexModule) {
    this._requestService = new RequestService(vuexModule, $config.okamApiBaseUrl)
  }

  public async GetCompany(orgNo: string): Promise<any> {
    const response = await this._requestService.GetRequest('/admin-kravia-invoices/company/' + encodeURIComponent(orgNo))
      .catch((error) => error?.response || error)
    const parsedResponse = this._requestService.TryParseResponseWithError(response?.response || response)
    if (parsedResponse.error) { throw new Error(parsedResponse.error || 'Kunne ikke hente bedriftsinformasjon') }
    return parsedResponse.data
  }

  public async SendInvoice(payload: any): Promise<any> {
    const response = await this._requestService.PostRequest('/admin-kravia-invoices/send', payload)
      .catch((error) => error?.response || error)
    const parsedResponse = this._requestService.TryParseResponseWithError(response?.response || response)
    if (parsedResponse.error) { throw new Error(parsedResponse.error || 'Kunne ikke sende faktura') }
    return parsedResponse.data
  }
}
