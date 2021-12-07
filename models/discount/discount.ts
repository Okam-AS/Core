import { DiscountType, DiscountApplicability } from '~/core/enums'
import { DiscountProducts, DiscountUsages } from '~/core/models'
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

    validFrom?: Date;
    validTo?: Date;

    discountUsages: Array<DiscountUsages>;
    discountProducts: Array<DiscountProducts>;
}
