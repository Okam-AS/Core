import { StoreOverviewModel } from './store-overview'

export class StoreOverviewResponseModel {
  isKam: boolean;
  stores: StoreOverviewModel[];
  kams: { id: number; name: string }[];
}
