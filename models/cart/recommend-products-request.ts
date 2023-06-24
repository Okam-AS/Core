import { CartLineItem, CategorySearchOptions } from '../../models'

export class RecommendProductsRequest {
  items: Array<CartLineItem> = [];
  searchOptions: CategorySearchOptions;
  storeId: number;
  userId: string;
  cartDiscountCode: string;
}