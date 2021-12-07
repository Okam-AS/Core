import { Product } from '~/core/models'
export class CartValidation {
  itemsOutOfStock: Array<Product>;
  deliveryAddressError: boolean;
  deliveryMethodError: boolean;
  priceDifferError: boolean;
  priceTooLowError: boolean;
  storeIsClosed: boolean;
  cartIsEmpty: boolean;
  itemsInStock: boolean;
  hasErrors: boolean;
  minimumPrice: number;
}