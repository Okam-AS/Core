export class OfferItemModel {
  offerItemId?: string;
  name: string;
  description: string;
  internalDescription: string;

  enableMonthlyFee: boolean;
  enableOnetimeFee: boolean;

  minMonthlyFee: number;
  minOnetimeFee: number;
  maxMonthlyFee: number;
  maxOnetimeFee: number;

  onetimeBonusToSeller: number;
  monthlyBonusToSeller: number;
  oneTimeBonusToSellersManager: number;
  monthlyBonusToSellersManager: number;

  onetimePercentBonusToSeller: number;
  monthlyPercentBonusToSeller: number;
  onetimePercentBonusToSellersManager: number;
  monthlyPercentBonusToSellersManager: number;

  createdAt: Date;
  createdBy: string;
  createdByName: string;
  updatedAt?: Date;
  updatedBy?: string;
  updatedByName?: string;
  inactive: boolean;
}
