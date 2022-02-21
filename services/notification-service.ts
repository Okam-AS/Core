import { ActionName, NotificationPlatform } from '../enums'
import { NotificationRegistration } from '../models'
import { IVuexModule } from '../interfaces'
import $config from '../helpers/configuration'
import { RequestService } from './request-service'

export class NotificationService {
    private _requestService: RequestService;
    private _vuexModule: IVuexModule

    constructor (vuexModule: IVuexModule) {
      this._requestService = new RequestService(vuexModule, $config.okamApiBaseUrl)
      this._vuexModule = vuexModule
    }

    // Turn off (called when user logges off)
    public async Deactivate () {
      const registrationId = this._vuexModule.state.notificationId
      if(!registrationId || !$config.notificationHub) return
      const response = await this._requestService.DeleteRequest('/notification/'+ $config.notificationHub +'/' + registrationId)
      return this._requestService.TryParseResponse(response) !== undefined
    }

    public RegisterNotificationOnServer (token) {
      this.CreateRegistrationId(token).then((notificationId) => {
        const model = new NotificationRegistration(
          notificationId,
          this._vuexModule?.getters?.clientPlatformName === "Android" ? NotificationPlatform.Fcm : NotificationPlatform.Apns,
          token,
          this._vuexModule?.state?.currentStore?.id ? this._vuexModule.state.currentStore.id : 0
        )
        this.Update(model)
      })
    }

    private async CreateRegistrationId (handle: string): Promise<string> {
      const response = await this._requestService.GetRequest('/notification/'+ $config.notificationHub +'/' + handle)
      const parsedResponse = this._requestService.TryParseResponse(response)
      if (parsedResponse === undefined) { return '' }
      this._vuexModule.dispatch(ActionName.SetNotificationId, parsedResponse.id)
      return parsedResponse.id
    }

    private async Update (model: NotificationRegistration): Promise<boolean> {
      const response = await this._requestService.PutRequest('/notification/'+ $config.notificationHub, model)
      return this._requestService.TryParseResponse(response) !== undefined
    }
   
}