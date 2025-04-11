export class OfferItemModel {
  offerItemId?: string;
  name: string;
  description: string;
  offeredMonthlyFee: number;
  offeredOnetimeFee: number;
  costMonthlyFee: number;
  costOnetimeFee: number;
  maximumMonthlyFee: number;
  maximumOnetimeFee: number;
  onetimeBonusToSeller: number;
  monthlyBonusToSeller: number;
  createdAt: Date;
  createdBy: string;
  createdByName: string;
  updatedAt?: Date;
  updatedBy?: string;
  updatedByName?: string;
  inactive: boolean;
}
