import $config from '../helpers/configuration'
import { BankAccount } from '../models'
import { IVuexModule } from '../interfaces'
import { RequestService } from './request-service'

export class BankAccountService {
    private _requestService: RequestService;
    private _vuexModule: IVuexModule;

    constructor (vuexModule: IVuexModule) {
      this._requestService = new RequestService(vuexModule, $config.okamApiBaseUrl)
      this._vuexModule = vuexModule
    }

    public async Login (accountId: string): Promise<any> {
      const response = await this._requestService.GetRequest('/bankaccount/login/' + accountId)
      const parsedResponse = this._requestService.TryParseResponse(response)
      if (parsedResponse === undefined) { throw new Error('Failed to get login link') }

      return parsedResponse
    }

    public async Onboard (accountId: string): Promise<any> {
      const response = await this._requestService.GetRequest('/bankaccount/onboarding/' + accountId)
      const parsedResponse = this._requestService.TryParseResponse(response)
      if (parsedResponse === undefined) { throw new Error('Failed to get onboarding link') }

      return parsedResponse
    }

    public async Create (storeid: number): Promise<BankAccount> {
      const response = await this._requestService.PostRequest('/bankaccount/create/' + storeid)
      const parsedResponse = this._requestService.TryParseResponse(response)
      if (parsedResponse === undefined) { throw new Error('Failed to create BankAccount') }

      return parsedResponse
    }

    public async Get (accountId: string): Promise<BankAccount> {
      const response = await this._requestService.GetRequest('/bankaccount/' + accountId)
      const parsedResponse = this._requestService.TryParseResponse(response)
      if (parsedResponse === undefined) { throw new Error('Failed to get BankAccount') }

      return parsedResponse
    }

    public async Delete (accountId: string): Promise<boolean> {
      const response = await this._requestService.DeleteRequest('/bankaccount/' + accountId)
      const parsedResponse = this._requestService.TryParseResponse(response)
      return parsedResponse === true
    }
}