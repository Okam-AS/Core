import { Login, SendVerificationToken, User, RewardCard } from '../models'
import { ICoreInitializer } from '../interfaces'
import { RequestService, NotificationService } from './index'

export class UserService {

  private _bearerToken: String;
  private _requestService: RequestService;
  private _notificationService: NotificationService;

  constructor(coreInitializer: ICoreInitializer) {
    this._bearerToken = coreInitializer.bearerToken;
    this._requestService = new RequestService(coreInitializer)
    this._notificationService = new NotificationService(coreInitializer)
  }

  public async GetRewardMemberships(storeId?: number): Promise<RewardCard[]> {
    if (!this._bearerToken) return [];
    const response = await this._requestService.GetRequest('/user/rewardmemberships/' + storeId);
    const parsedResponse = this._requestService.TryParseResponse(response);
    if (parsedResponse === undefined) return [];
    return parsedResponse;
  }

  public async UpdateAddress(fullAddress: string, zipCode: string, city: string): Promise<boolean> {
    if (!this._bearerToken) return false;
    await this._requestService.PostRequest('/user/address/', { fullAddress, zipCode, city })
    return true
  }

  public async AddFavoriteProduct(productId: string): Promise<boolean> {
    if (!productId || !this._bearerToken) return false;
    await this._requestService.PostRequest('/user/favorite/add/' + productId)
    return true
  }

  public async RemoveFavoriteProduct(productId: string): Promise<boolean> {
    if (!productId || !this._bearerToken) return false;
    await this._requestService.PostRequest('/user/favorite/remove/' + productId)
    return true
  }

  public Logout(notificationId: string, clearState?: Function) {
    this._notificationService.Deactivate(notificationId)
    if (clearState) clearState()
  }

  public async TokenIsValid(): Promise<boolean> {
    if (!this._bearerToken) { return false }
    const response = await this._requestService.GetRequest('/user')
    const parsedResponse = this._requestService.TryParseResponse(response)
    return response.statusCode !== 401 && parsedResponse !== undefined
  }

  public async Login(phoneNumber: string, token: string): Promise<User> {
    const response = await this._requestService.PostRequest('/user/login', new Login(phoneNumber, token))
    const parsedResponse = this._requestService.TryParseResponse(response)
    if (parsedResponse === undefined) return Promise.reject();
    return parsedResponse
  }

  public async VerifyToken(phoneNumber: string, token: string): Promise<boolean> {
    const response = await this._requestService.PostRequest('/user/login', new Login(phoneNumber, token))
    const parsedResponse = this._requestService.TryParseResponse(response)
    return parsedResponse !== undefined
  }

  public async LoginAdmin(phoneNumber: string, token: string, setCurrentStoreFunction?: Function): Promise<boolean> {
    const _this = this
    const response = await _this._requestService.PostRequest('/user/login', new Login(phoneNumber, token))
    const parsedResponse = _this._requestService.TryParseResponse(response)
    if (parsedResponse === undefined) { return false }
    if (typeof setCurrentStoreFunction === 'function') { setCurrentStoreFunction() }
    return parsedResponse
  }

  public async Delete(logoutFunction): Promise<boolean> {
    const response = await this._requestService.DeleteRequest('/user')
    const parsedResponse = this._requestService.TryParseResponse(response)
    if (parsedResponse === undefined) { return false }
    if (logoutFunction) logoutFunction()
    return true
  }

  public async SendVerificationToken(phoneNumber: string): Promise<boolean> {
    const response = await this._requestService.PostRequest('/user/sendverificationtoken', new SendVerificationToken(phoneNumber))
    return this._requestService.TryParseResponse(response) === true
  }
}