import { StoreOverviewModel } from './store-overview'

export class StoreOverviewResponseModel {
  isKeyAccountManager: boolean;
  stores: StoreOverviewModel[];
  kams: { id: number; name: string }[];
}
