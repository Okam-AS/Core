import { INotificationModule } from '../interfaces'

class NotificationModuleNUXT implements INotificationModule {
    areNotificationsEnabled: any;
    registerForPushNotifications: any;
    addOnPushTokenReceivedCallback: any;
    addOnMessageReceivedCallback: any;
    schedule: any;
}

export const NotificationModule = NotificationModuleNUXT