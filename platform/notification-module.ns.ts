import { INotificationModule } from '../interfaces'

class NotificationModuleNS implements INotificationModule {
    areNotificationsEnabled: any;
    registerForPushNotifications: any;
    addOnPushTokenReceivedCallback: any;
    addOnMessageReceivedCallback: any;
    schedule: any;

    constructor () {
      const fb = require('@nativescript/firebase/messaging' + '')
      this.areNotificationsEnabled = fb.messaging.areNotificationsEnabled
      this.registerForPushNotifications = fb.messaging.registerForPushNotifications
      this.addOnPushTokenReceivedCallback = fb.messaging.addOnPushTokenReceivedCallback
      this.addOnMessageReceivedCallback = fb.messaging.addOnMessageReceivedCallback

      const localNotifications = require('@nativescript/local-notifications' + '')
      this.schedule = localNotifications.LocalNotifications.schedule
    }
}

export const NotificationModule = NotificationModuleNS