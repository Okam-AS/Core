import { ProductVariantOption } from '../index'

export class ProductVariant {
    id: string;
    orderIndex: number;
    name: string;
    options: Array<ProductVariantOption>;
    multiselect: boolean;
    required: boolean;
    productId: string;
}
