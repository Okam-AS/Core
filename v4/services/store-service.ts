import { Store, StoreTip, StoreRegistration, OpeningHour, Address, StoreUserSetting, BrregData, StorePayment, StoreFees, CategorySearchOptions } from '../models'
import { IServiceCtor } from '../interfaces'
import { RequestService, UserService } from './'

export class StoreService {
    private _requestService: RequestService;
    private _userService: UserService;

    constructor (serviceCtor: IServiceCtor) {
      this._requestService = new RequestService(serviceCtor)
      this._userService = new UserService(serviceCtor)
    }

    public async ImageExists (imageUrl: string) {
      const response = await this._requestService.GetHeadRequest(imageUrl)
      return response
    }

    public async Get (id: number): Promise<Store> {
      const response = await this._requestService.GetRequest('/stores/' + id)
      const parsedResponse = this._requestService.TryParseResponse(response)
      if (parsedResponse === undefined) { throw new Error('Failed to get store') }

      return parsedResponse
    }

    public async GetForConsumer (id: number, searchOptions: CategorySearchOptions): Promise<Store> {
      const response = await this._requestService.PostRequest('/stores/' + id + '/consumer', searchOptions)
      const parsedResponse = this._requestService.TryParseResponse(response)
      if (parsedResponse === undefined) { throw new Error('Failed to get store') }

      return parsedResponse
    }

    public async Delete (id: number): Promise<boolean> {
      const response = await this._requestService.DeleteRequest('/stores/' + id)
      const parsedResponse = this._requestService.TryParseResponse(response)
      return parsedResponse !== undefined
    }

    public async Register (name: string, legalName: string, vat: number, fullAddress: string, zipCode: string, city: string, acceptedTerms: boolean) {
      const response = await this._requestService.PostRequest('/stores/register',
        new StoreRegistration(name, legalName, vat, fullAddress, zipCode, city, acceptedTerms))
      return this._requestService.TryParseResponse(response)
    }

    public async AddEmployee (storeId: number, phoneNumber: string): Promise<boolean> {
      const response = await this._requestService.PostRequest('/stores/addemployee', { storeId, phoneNumber, asAdmin: true })
      const parsedResponse = this._requestService.TryParseResponse(response)
      return parsedResponse !== undefined
    }

    public async RemoveEmployee (storeId: number, userId: string): Promise<boolean> {
      const response = await this._requestService.PostRequest('/stores/removeemployee/', { storeId, userId })
      const parsedResponse = this._requestService.TryParseResponse(response)
      return parsedResponse !== undefined
    }

    public async UpdateOpeningHours (storeId: number, openingHours: Array<OpeningHour>): Promise<boolean> {
      const response = await this._requestService.PutRequest('/stores/' + storeId + '/openinghours', { openingHours })
      const parsedResponse = this._requestService.TryParseResponse(response)
      return parsedResponse !== undefined
    }

    public async UpdateAddress (storeId: number, address: Address): Promise<boolean> {
      const response = await this._requestService.PutRequest('/stores/' + storeId + '/address', address)
      const parsedResponse = this._requestService.TryParseResponse(response)
      return parsedResponse !== undefined
    }

    public async CreateOrUpdateHomeDeliveryFromAddress (storeId: number, address: Address): Promise<boolean> {
      const response = await this._requestService.PostRequest('/stores/' + storeId + '/homedeliveryfromaddress', address)
      const parsedResponse = this._requestService.TryParseResponse(response)
      return parsedResponse !== undefined
    }

    public async UpdateTip (storeId: number, tip: StoreTip): Promise<boolean> {
      const response = await this._requestService.PutRequest('/stores/' + storeId + '/tip', tip)
      const parsedResponse = this._requestService.TryParseResponse(response)
      return parsedResponse !== undefined
    }

    public async UpdateSelfCheckout (storeId: number, newValue: boolean): Promise<boolean> {
      const response = await this._requestService.PutRequest('/stores/' + storeId + '/selfcheckout/' + newValue)
      const parsedResponse = this._requestService.TryParseResponse(response)
      return parsedResponse !== undefined
    }

    public async UpdateAllowOrdersAfterOpeningHours (storeId: number, newValue: boolean): Promise<boolean> {
      const response = await this._requestService.PutRequest('/stores/' + storeId + '/allowordersafteropeninghours/' + newValue)
      const parsedResponse = this._requestService.TryParseResponse(response)
      return parsedResponse !== undefined
    }

    public async UpdateSelfPickUp (storeId: number, newValue: boolean): Promise<boolean> {
      const response = await this._requestService.PutRequest('/stores/' + storeId + '/selfpickup/' + newValue)
      const parsedResponse = this._requestService.TryParseResponse(response)
      return parsedResponse !== undefined
    }

    public async UpdateHomeDelivery (storeId: number, newValue: boolean): Promise<boolean> {
      const response = await this._requestService.PutRequest('/stores/' + storeId + '/homedelivery/' + newValue)
      const parsedResponse = this._requestService.TryParseResponse(response)
      return parsedResponse !== undefined
    }

    public async UpdateTableDelivery (storeId: number, newValue: boolean): Promise<boolean> {
      const response = await this._requestService.PutRequest('/stores/' + storeId + '/tabledelivery/' + newValue)
      const parsedResponse = this._requestService.TryParseResponse(response)
      return parsedResponse !== undefined
    }

    public async UpdatePayment (storeId: number, model: StorePayment): Promise<boolean> {
      const response = await this._requestService.PostRequest('/stores/' + storeId + '/payment', model)
      const parsedResponse = this._requestService.TryParseResponse(response)
      return parsedResponse !== undefined
    }

    public async CreateOrUpdateStoreUserSetting (storeId: number, model: StoreUserSetting): Promise<boolean> {
      const response = await this._requestService.PostRequest('/stores/' + storeId + '/usersettings', model)
      const parsedResponse = this._requestService.TryParseResponse(response)
      return parsedResponse !== undefined
    }

    public async SetMinimumAmountForDelivery (storeId: number, amount: number): Promise<boolean> {
      const response = await this._requestService.PostRequest('/stores/' + storeId + '/minimumamountfordelivery/' + amount)
      const parsedResponse = this._requestService.TryParseResponse(response)
      return parsedResponse !== undefined
    }

    public async GetBrregData (vat: string): Promise<BrregData> {
      const response = await this._requestService.GetRequest('/stores/brreg/' + vat)
      const parsedResponse = this._requestService.TryParseResponse(response)
      if (parsedResponse === undefined) { throw new Error('Failed to get Brreg data') }

      return parsedResponse
    }

    public async GetFees (id: number): Promise<StoreFees> {
      const response = await this._requestService.GetRequest('/stores/' + id + '/fees')
      const parsedResponse = this._requestService.TryParseResponse(response)
      if (parsedResponse === undefined) { throw new Error('Failed to get store fees') }
      return parsedResponse
    }

    public async Feedback (feedback: string) {
      const response = await this._requestService.PostRequest('/stores/feedback', { feedback })
      const parsedResponse = this._requestService.TryParseResponse(response)
      if (parsedResponse === undefined) { throw new Error('Failed to post feedback') }
    }

    public async GetAll (location?: any): Promise<Array<Store>> {
      const queryString = !!location && location.latitude && location.longitude ? '?longitude=' + location.longitude + '&latitude=' + location.latitude : ''
      const response = await this._requestService.GetRequest('/stores' + queryString)
      const parsedResponse = this._requestService.TryParseResponse(response)
      if (parsedResponse === undefined) { throw new Error('Failed to get stores') }

      return parsedResponse
    }

}