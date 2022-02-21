import { NotificationPlatform } from '../../enums'
export class NotificationRegistration {
    registrationId: string;
    platform: NotificationPlatform;
    handle: string;
    storeId: number;

    constructor (
      registrationId: string,
      platform: NotificationPlatform,
      handle: string,
      storeId?: number) {
      this.registrationId = registrationId
      this.platform = platform
      this.handle = handle
      if(storeId)
      this.storeId = storeId
    }
}