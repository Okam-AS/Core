import { NotificationPlatform } from '../enums'
import { NotificationRegistration } from '../models'
import { IServiceCtor } from '../interfaces'
import $config from '../../helpers/configuration'
import { RequestService } from './request-service'

export class NotificationService {
    private _requestService: RequestService;

    constructor (serviceCtor: IServiceCtor) {
      this._requestService = new RequestService(serviceCtor)
    }

    // Turn off (called when user logges off)
    public async Deactivate (notificationId: string) {
      if (!notificationId || !$config.notificationHub) { return }
      const response = await this._requestService.DeleteRequest('/notification/' + $config.notificationHub + '/' + notificationId)
      return this._requestService.TryParseResponse(response) !== undefined
    }

    public RegisterNotificationOnServer (token, platform: NotificationPlatform, storeId?: number) {
      this.CreateRegistrationId(token).then((notificationId) => {
        const model = new NotificationRegistration(
          notificationId,
          platform,
          token,
          storeId
        )
        this.Update(model)
      })
    }

    private async CreateRegistrationId (handle: string): Promise<string> {
      const response = await this._requestService.GetRequest('/notification/' + $config.notificationHub + '/' + handle)
      const parsedResponse = this._requestService.TryParseResponse(response)
      if (parsedResponse === undefined) { return '' }
      return parsedResponse.id
    }

    private async Update (model: NotificationRegistration): Promise<boolean> {
      const response = await this._requestService.PutRequest('/notification/' + $config.notificationHub, model)
      return this._requestService.TryParseResponse(response) !== undefined
    }
}