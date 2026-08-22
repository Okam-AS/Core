import { StoreOverviewModel } from './store-overview'
import { KamUserModel } from '../kam/kam-user-model'

export class StoreOverviewResponseModel {
  isKeyAccountManager: boolean;
  isPowerUser: boolean;
  stores: StoreOverviewModel[];
  kams: KamUserModel[];
}
