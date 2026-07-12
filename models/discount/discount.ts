import { DiscountType, DiscountApplicability, StaffPriceGroup } from "../../enums";
import { DiscountProducts, DiscountUsages } from "../../models";
export class Discount {
  id: string;
  storeId: number;
  label: string;
  code: string;
  amount: number;
  // The value the backend actually sends (percent number, or a fixed amount in kroner). `amount`
  // above is a legacy field the wire does not populate; the editor and POS both read `discount`.
  discount: number;

  type: DiscountType;
  applicability: DiscountApplicability;

  minimumOrderAmountEnabled: boolean;
  minimumOrderAmount: number;

  maximumTotalUsageCountEnabled: boolean;
  maximumTotalUsageCount: number;

  maximumUsagePerCustomerCountEnabled: boolean;
  maximumUsagePerCustomerCount: number;

  giveRewardInsteadOfDiscountEnabled: boolean;

  expired: boolean;
  timedEnabled: boolean;
  validFrom?: Date;
  validTo?: Date;

  // POS (kassa) discount fields: the POS uses this shared catalogue instead of a separate entity.
  // showInPos gates which discounts the cashier can pick; requiresManagerPin forces a Leder PIN;
  // staffGroup marks a staff-price variant; sortOrder orders the POS discount list.
  showInPos: boolean;
  requiresManagerPin: boolean;
  staffGroup?: StaffPriceGroup;
  sortOrder: number;

  discountUsages: Array<DiscountUsages>;
  discountProducts: Array<DiscountProducts>;
}
