import { NotificationPlatform } from '../enums'
import { NotificationRegistration } from '../models'
import { ICoreInitializer } from '../interfaces'
import $config from '../helpers/configuration'
import { RequestService } from './request-service'

export class NotificationService {
  private _requestService: RequestService;

  constructor(coreInitializer: ICoreInitializer) {
    this._requestService = new RequestService(coreInitializer)
  }

  // Turn off (called when user logges off)
  public async Deactivate(notificationId: string) {
    if (!notificationId || !$config.notificationHub) { return }
    const response = await this._requestService.DeleteRequest('/notification/' + $config.notificationHub + '/' + notificationId)
    return this._requestService.TryParseResponse(response) !== undefined
  }

  public async RegisterNotificationOnServer(token, platform: NotificationPlatform, storeId?: number) {
    const notificationId = await this.CreateRegistrationId(token);
    if (!notificationId) return '';

    const model = new NotificationRegistration(
      notificationId,
      platform,
      token,
      storeId
    )
    await this.Update(model);
    return notificationId;
  }

  private async CreateRegistrationId(handle: string): Promise<string> {
    const response = await this._requestService.GetRequest('/notification/' + $config.notificationHub + '/' + handle)
    const parsedResponse = this._requestService.TryParseResponse(response)
    if (parsedResponse === undefined) { return '' }
    return parsedResponse.id
  }

  private async Update(model: NotificationRegistration): Promise<boolean> {
    const response = await this._requestService.PutRequest('/notification/' + $config.notificationHub, model)
    return this._requestService.TryParseResponse(response) !== undefined
  }
}