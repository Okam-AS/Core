import { DeliveryType } from '../../enums'
import { DeliveryMethod, CartLineItem, CartCalculation } from '../../models'
export class Cart {
  id: string;
  items: Array<CartLineItem> = [];
  storeId: number;

  homeDeliveryMethodId: string;
  homeDeliveryMethod: DeliveryMethod;

  ignoreLegecyIsSelfPickupBool: boolean;
  deliveryType: DeliveryType;

  discountCode: string;
  fullAddress: string;
  zipCode: string;
  city: string;
  paymentIntentId: string;
  comment: string;

  tipPercent: number;
  tableName: string;

  itemsCountInCategory;

  calculations: CartCalculation;
}
