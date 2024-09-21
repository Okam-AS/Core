import { DiscountType, DiscountApplicability } from "../../enums";
import { DiscountProducts, DiscountUsages } from "../../models";
export class Discount {
  id: string;
  storeId: number;
  label: string;
  code: string;
  amount: number;

  type: DiscountType;
  applicability: DiscountApplicability;

  minimumOrderAmountEnabled: boolean;
  minimumOrderAmount: number;

  maximumTotalUsageCountEnabled: boolean;
  maximumTotalUsageCount: number;

  maximumUsagePerCustomerCountEnabled: boolean;
  maximumUsagePerCustomerCount: number;

  expired: boolean;
  timedEnabled: boolean;
  validFrom?: Date;
  validTo?: Date;

  discountUsages: Array<DiscountUsages>;
  discountProducts: Array<DiscountProducts>;
}
