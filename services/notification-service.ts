import { ActionName, NotificationPlatform } from '../enums'
import { NotificationRegistration } from '../models'
import { NotificationModule } from '../platform'
import { IVuexModule } from '../interfaces'
import $config from '../helpers/configuration'
import { RequestService } from './request-service'

export class NotificationService {
    private _requestService: RequestService;
    private _notificationModule: typeof NotificationModule;
    private _vuexModule: IVuexModule

    constructor (vuexModule: IVuexModule) {
      this._requestService = new RequestService(vuexModule, $config.okamApiBaseUrl)
      this._notificationModule = new NotificationModule()
      this._vuexModule = vuexModule
    }

    public IsEnabled () {
      const enabled = !!this._notificationModule.areNotificationsEnabled()
      const loggedIn = this._vuexModule.state.currentUser && this._vuexModule.state.currentUser.id
      if (enabled && loggedIn && !this._vuexModule.state.notificationApproved) { this._vuexModule.dispatch(ActionName.SetNotificationApproved, true) }
      return this._vuexModule.state.notificationApproved
    }

    public Register (onNotificationReceived) {
      this._vuexModule.dispatch(ActionName.SetNotificationApproved, true)
      this._notificationModule.registerForPushNotifications({
        onPushTokenReceivedCallback: token => this.RegisterNotificationOnServer(token),
        onMessageReceivedCallback: data => this.MessageReceivedCallback(data, onNotificationReceived),
        showNotifications: true,
        showNotificationsWhenInForeground: true
      })
    }

    // Already registered, but was deactivated
    public Activate (onNotificationReceived) {
      const that = this
      setTimeout(() => {
        if (this.IsEnabled()) {
          this._notificationModule.addOnPushTokenReceivedCallback(token => that.RegisterNotificationOnServer(token))
          this._notificationModule.addOnMessageReceivedCallback(message => that.MessageReceivedCallback(message, onNotificationReceived))
        }
      }, 500)
    }

    // Turn off (called when user logges off)
    public Deactivate () {
      this._vuexModule.dispatch(ActionName.SetNotificationApproved, false)
      if (this._vuexModule.state.notificationId) { this.Delete(this._vuexModule.state.notificationId) }
    }

    private RegisterNotificationOnServer (token) {
      this.CreateRegistrationId(token).then((notificationId) => {
        const model = new NotificationRegistration(
          notificationId,
          $config.isAndroid ? NotificationPlatform.Fcm : NotificationPlatform.Apns,
          token,
          this._vuexModule?.state?.currentStore?.id ? this._vuexModule.state.currentStore.id : 0
        )
        this.Update(model)
      })
    }

    private MessageReceivedCallback (data, onNotificationReceived) {
      setTimeout(() => {
        if ($config.isAndroid) {
          this._notificationModule.schedule([
            {
              title: 'Okam',
              body: data.data.message,
              thumbnail: false,
              forceShowWhenInForeground: true
            }
          ])
        }
        if (typeof onNotificationReceived === 'function') { onNotificationReceived() }
      }, 500)
    }

    private async CreateRegistrationId (handle: string): Promise<string> {
      const response = await this._requestService.GetRequest('/notification/'+ $config.notificationHub +'/' + handle)
      const parsedResponse = this._requestService.TryParseResponse(response)
      if (parsedResponse === undefined) { return '' }
      this._vuexModule.dispatch(ActionName.SetNotificationId, parsedResponse.id)
      return parsedResponse.id
    }

    private async Update (model: NotificationRegistration): Promise<boolean> {
      const response = await this._requestService.PutRequest('/notification/'+ $config.notificationHub +'', model)
      return this._requestService.TryParseResponse(response) !== undefined
    }

    private async Delete (registrationId: string): Promise<boolean> {
      const response = await this._requestService.DeleteRequest('/notification/'+ $config.notificationHub +'/' + registrationId)
      return this._requestService.TryParseResponse(response) !== undefined
    }
}