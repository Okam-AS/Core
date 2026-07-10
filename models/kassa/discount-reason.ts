import { DiscountType, StaffPriceGroup } from '../../enums';

export class DiscountReason {
  discountReasonId: number;
  storeId: number;
  name: string;
  discountType: DiscountType;
  value: number;
  staffGroup: StaffPriceGroup | null;
  requiresManagerPin: boolean;
  sortOrder: number;
  isActive: boolean;
  created: Date;
}

export class DiscountReasonUpsertModel {
  storeId: number;
  name: string;
  discountType: DiscountType;
  value: number;
  staffGroup: StaffPriceGroup | null;
  requiresManagerPin: boolean;
  sortOrder: number;
  isActive: boolean;
}
