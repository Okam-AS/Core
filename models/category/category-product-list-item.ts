import { Product, Category } from '../index'

export class CategoryProductListItem {
    id: string;
    orderIndex: number;
    isHeading: boolean;
    heading: string;
    productId: string;
    product: Product;
    categoryId: string;
    category: Category;
}