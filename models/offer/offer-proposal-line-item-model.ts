export class OfferProposalLineItemModel {
  id: number;
  offerProposalId: number;
  originalOfferItemId: string;
  name: string;
  description: string;
  internalDescription: string;
  quantity: number;
  notes: string;
  internalNotes: string;
  showMonthlyFee: boolean;
  showOnetimeFee: boolean;
  monthlyFee: number;
  onetimeFee: number;
}
