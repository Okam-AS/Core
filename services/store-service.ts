import $config from '../helpers/configuration'
import { Store, StoreTip, StoreRegistration, OpeningHour, Address, StoreUserSetting, BrregData, StorePayment, StoreFees, CategorySearchOptions } from '../models'
import { MutationName, HttpMethod, DeliveryType } from '../enums'
import { IVuexModule } from '../interfaces'
import { RequestService, UserService } from './'

export class StoreService {
    private _requestService: RequestService;
    private _vuexModule: IVuexModule;
    private _userService: UserService;

    constructor (vuexModule: IVuexModule) {
      this._requestService = new RequestService(vuexModule, $config.okamApiBaseUrl)
      this._vuexModule = vuexModule
      this._userService = new UserService(vuexModule)
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
      if (parsedResponse === undefined) { return false }
      this._userService.Logout()
      return true
    }

    public async Register (name: string, legalName: string, vat: number, fullAddress: string, zipCode: string, city: string, acceptedTerms: boolean) {
      const response = await this._requestService.PostRequest('/stores/register',
        new StoreRegistration(name, legalName, vat, fullAddress, zipCode, city, acceptedTerms))
      return this._requestService.TryParseResponse(response)
    }

    public UploadLogo (imagePath, storeId: number) {
      this._requestService.FormdataRequest('/stores/logo', HttpMethod.POST, 'Image', imagePath, [{ name: 'NumberId', value: storeId + '' }])
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

    public GetStoresAndSetState = (sort, thenHandler?, catchHandler?) => {
      const location = { latitude: 0, longitude: 0 }
      if (sort && sort === 'nearest') {
        location.latitude = this._vuexModule.state.userLat ?? 0
        location.longitude = this._vuexModule.state.userLng ?? 0
      }
      this.GetAll(location)
        .then((stores) => {
          if (Array.isArray(stores)) {
            this._vuexModule.commit(MutationName.SetStores, stores)
          }
          if (thenHandler) { thenHandler(stores) }
        }).catch(() => {
          if (catchHandler) { catchHandler() }
        })
    }

    public GetStoreAndSetCurrentStoreState = (storeId, thenHandler?, catchHandler?) => {
      this._getStoreAndSetState(storeId, thenHandler, catchHandler, MutationName.SetCurrentStore)
    }

    public GetStoreAndSetState = (storeId, thenHandler?, catchHandler?) => {
      this._getStoreAndSetState(storeId, thenHandler, catchHandler, MutationName.SetStore)
    }

    public GetStoreAndSetCurrentStoreStateForConsumer = (storeId, thenHandler?, catchHandler?) => {
      const cart = this._vuexModule.getters.cartByStoreId(storeId) || { deliveryType: DeliveryType.NotSet };
      this._getStoreAndSetState(storeId, thenHandler, catchHandler, MutationName.SetCurrentStore, { deliveryType: cart.deliveryType })
    }

    public GetStoreAndSetStateForConsumer = (storeId, thenHandler?, catchHandler?) => {
      const cart = this._vuexModule.getters.cartByStoreId(storeId) || { deliveryType: DeliveryType.NotSet };
      this._getStoreAndSetState(storeId, thenHandler, catchHandler, MutationName.SetStore, { deliveryType: cart.deliveryType })
    }

    private _getStoreAndSetState (storeId: any, thenHandler: any, catchHandler: any, mutationName: MutationName, searchOptions?: CategorySearchOptions) {
      const getFunction = searchOptions === undefined ? this.Get(storeId) : this.GetForConsumer(storeId,searchOptions);
      getFunction.then((store) => {
        if (store && store.id) {
          this._vuexModule.commit(mutationName, store)
        }
        if (thenHandler) { thenHandler(store) }
      }).catch((error) => {
        if (catchHandler) { catchHandler(error) }
      })
    }
}