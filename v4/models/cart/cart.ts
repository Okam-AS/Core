import { DeliveryType, PaymentType } from "../../enums";
import { DeliveryMethod, CartLineItem, CartCalculation } from "../../models";
export class Cart {
  id: string = "";
  items: Array<CartLineItem> = [];
  storeId: number = 0;

  requestedCompletion?: Date = undefined;

  homeDeliveryMethodId?: string = undefined;
  homeDeliveryMethod?: DeliveryMethod = undefined;

  ignoreLegecyIsSelfPickupBool: boolean = true;
  deliveryType: DeliveryType = DeliveryType.NotSet;

  ignoreLegecyIsWaiterOrderBool: boolean = true;
  paymentType: PaymentType = PaymentType.NotSet;

  discountCode?: string = undefined;
  fullAddress?: string = undefined;
  zipCode?: string = undefined;
  city?: string = undefined;
  paymentIntentId?: string = undefined;
  vippsOrderId?: string = undefined;
  comment?: string = undefined;

  tipPercent: number = 0;
  tipAmount: number = 0;
  tableName?: string = undefined;

  useReward: boolean = false;

  itemsCountInCategory;

  calculations: CartCalculation = {} as CartCalculation;
}
