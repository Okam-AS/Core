export class OfferItemSnapshotModel {
  snapshotId: string;
  originalOfferItemId: string;

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
  oneTimeBonusToSellersManager: number;
  monthlyBonusToSellersManager: number;

  snapshotCreatedAt: Date;
}
