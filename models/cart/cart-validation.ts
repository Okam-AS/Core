import { Product } from "../../models";
export class CartValidation {
  itemsOutOfStock: Array<Product>;
  deliveryAddressError: boolean;
  deliveryMethodError: boolean;
  priceDifferError: boolean;
  priceTooLowError: boolean;
  storeIsClosed: boolean;
  cartIsEmpty: boolean;
  itemsInStock: boolean;
  paymentTypeError: boolean;
  rewardBalanceTooLow: boolean;
  hasErrors: boolean;
  minimumPrice: number;
}
