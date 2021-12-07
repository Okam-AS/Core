import { NotificationPlatform } from '~/core/enums'
export class NotificationRegistration {
    registrationId: string;
    platform: NotificationPlatform;
    handle: string;

    constructor (
      registrationId: string,
      platform: NotificationPlatform,
      handle: string) {
      this.registrationId = registrationId
      this.platform = platform
      this.handle = handle
    }
}