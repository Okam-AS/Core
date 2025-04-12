import { StoreOverviewModel } from './store-overview'

export class StoreOverviewResponseModel {
  isKeyAccountManager: boolean;
  isPowerUser: boolean;
  stores: StoreOverviewModel[];
  kams: { id: number; name: string }[];
}
