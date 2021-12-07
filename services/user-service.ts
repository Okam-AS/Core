import { Login, SendVerificationToken, Address } from '../models'
import { ActionName } from '../enums'
import { IVuexModule } from '../interfaces'
import $config from '../helpers/configuration'
import { RequestService, NotificationService } from './index'

export class UserService {
    private _requestService: RequestService;
    private _notificationService: NotificationService;
    private _vuexModule: IVuexModule;

    constructor (vuexModule: IVuexModule) {
      this._requestService = new RequestService(vuexModule, $config.okamApiBaseUrl)
      this._notificationService = new NotificationService(vuexModule)
      this._vuexModule = vuexModule
    }

    public Logout () {
      this._notificationService.Deactivate()
      this._vuexModule.dispatch(ActionName.ClearState)
    }

    public async Get (): Promise<boolean> {
      if (!this._vuexModule.state.currentUser?.token) { return false }
      const response = await this._requestService.GetRequest('/user')
      const parsedResponse = this._requestService.TryParseResponse(response)
      if (response.statusCode === 401 && this._vuexModule.state.currentUser.token) {
        this.Logout()
      }
      return parsedResponse !== undefined
    }

    public async Login (phoneNumber: string, token: string): Promise<boolean> {
      const response = await this._requestService.PostRequest('/user/login', new Login(phoneNumber, token))
      const parsedResponse = this._requestService.TryParseResponse(response)
      if (parsedResponse === undefined) { return false }
      this._vuexModule.dispatch(ActionName.SetCurrentUser, parsedResponse)
      return true
    }

    public async LoginAdmin (phoneNumber: string, token: string, setCurrentStoreFunction?: Function): Promise<boolean> {
      const _this = this
      const response = await _this._requestService.PostRequest('/user/login', new Login(phoneNumber, token))
      const parsedResponse = _this._requestService.TryParseResponse(response)
      if (parsedResponse === undefined) { return false }
      _this._vuexModule.dispatch(ActionName.SetCurrentUser, parsedResponse)
      if (typeof setCurrentStoreFunction === 'function') { setCurrentStoreFunction() }
      return true
    }

    public UpdateDeliveryAddress (model: Address): boolean {
      this._vuexModule.dispatch(ActionName.SetDeliveryAddress, model)
      return true
    }

    public async Delete (): Promise<boolean> {
      const response = await this._requestService.DeleteRequest('/user')
      const parsedResponse = this._requestService.TryParseResponse(response)
      if (parsedResponse === undefined) { return false }
      this.Logout()
      return true
    }

    public async SendVerificationToken (phoneNumber: string): Promise<boolean> {
      const response = await this._requestService.PostRequest('/user/sendverificationtoken', new SendVerificationToken(phoneNumber))
      return this._requestService.TryParseResponse(response) === true
    }
}