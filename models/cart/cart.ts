import { ICartRootProperties } from  '../../interfaces';
import { DeliveryType, PaymentType } from '../../enums'
import { DeliveryMethod, CartLineItem, CartCalculation } from '../../models'
export class Cart implements ICartRootProperties {
  id: string;
  items: Array<CartLineItem> = [];
  storeId: number;

  requestedCompletion: Date;

  homeDeliveryMethodId: string;
  homeDeliveryMethod: DeliveryMethod;

  ignoreLegecyIsSelfPickupBool: boolean;
  deliveryType: DeliveryType;

  ignoreLegecyIsWaiterOrderBool: boolean;
  paymentType: PaymentType;

  discountCode: string;
  fullAddress: string;
  zipCode: string;
  city: string;
  paymentIntentId: string;
  vippsOrderId: string;
  comment: string;

  tipPercent: number;
  tipAmount: number;
  tableName: string;

  itemsCountInCategory;

  calculations: CartCalculation;
}
