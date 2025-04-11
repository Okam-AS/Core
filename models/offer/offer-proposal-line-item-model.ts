import { OfferItemSnapshotModel } from './offer-item-snapshot-model';

export class OfferProposalLineItemModel {
  id: number;
  offerProposalId: number;
  originalOfferItemId: string;
  snapshotId: string;
  quantity: number;
  itemSnapshot?: OfferItemSnapshotModel;
}
