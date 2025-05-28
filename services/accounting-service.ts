import $config from '../helpers/configuration'
import { AccountingConfiguration } from '../models'
import { IVuexModule } from '../interfaces'
import { RequestService } from './'

export class AccountingService {
  private _requestService: RequestService
  private _vuexModule: IVuexModule

  constructor(vuexModule: IVuexModule) {
    this._requestService = new RequestService(vuexModule, $config.okamApiBaseUrl)
    this._vuexModule = vuexModule
  }

  /**
   * Gets the accounting configuration for a store
   * @param storeId The store ID
   * @returns Promise<AccountingConfiguration>
   */
  public async GetAccountingConfiguration(storeId: number): Promise<AccountingConfiguration> {
    const response = await this._requestService.GetRequest(`/accounting/store/${storeId}/configuration`)
    const parsedResponse = this._requestService.TryParseResponse(response)
    if (parsedResponse === undefined) { 
      throw new Error('Failed to get accounting configuration') 
    }
    return parsedResponse
  }

  /**
   * Updates the accounting configuration for a store
   * @param storeId The store ID
   * @param configuration The accounting configuration to update
   * @returns Promise<boolean>
   */
  public async UpdateAccountingConfiguration(storeId: number, configuration: AccountingConfiguration): Promise<boolean> {
    const response = await this._requestService.PutRequest(`/accounting/store/${storeId}/configuration`, {
      accountNumber0Percent: configuration.accountNumber0Percent,
      accountNumber15Percent: configuration.accountNumber15Percent,
      accountNumber25Percent: configuration.accountNumber25Percent,
      accountNumberReceivables: configuration.accountNumberReceivables,
      enabled: configuration.enabled
    })
    const parsedResponse = this._requestService.TryParseResponse(response)
    return parsedResponse !== undefined
  }
}
