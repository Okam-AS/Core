import { DeliveryType } from '~/core/enums'
import { DeliveryMethod, CartLineItem, CartCalculation } from '~/core/models'
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
