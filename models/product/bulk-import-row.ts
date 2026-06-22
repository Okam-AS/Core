import { ProductVariant } from '../index'

export class BulkImportRow {
    categoryName: string;
    name: string;
    description: string;
    priceAmount: number;
    Tax: number;
    depositAmount: number;
    soldOut: boolean;
    variants: Array<ProductVariant>;
}