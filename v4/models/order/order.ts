import { OrderStatus, DeliveryType, PaymentType } from "../../enums";
import { OrderLineItem, TaxDetail, RewardTransaction, WoltDeliveryInfo } from "../../models";

export class Order {
  id: string;
  friendlyOrderId: string;

  requestedCompletion: Date;

  platform: string;
  userId: string;
  storeId: string;
  pickup: Date;
  created: Date;
  completed: Date;
  status: OrderStatus;
  items: Array<OrderLineItem>;
  taxDetails: Array<TaxDetail>;

  paymentIntentId: string;
  vippsOrderId: string;

  tableName: string;
  dateTimeNow: Date;
  countdownEndTime: Date;

  itemsAmount: number;
  itemsAmountLineThrough: number;
  orderDiscountAmount: number;
  deliveryAmount: number;
  serviceFeeAmount: number;
  woltServiceFeeAmount: number;
  finalAmount: number;

  paymentType: PaymentType;
  deliveryType: DeliveryType;

  fullAddress: string;
  zipCode: string;
  city: string;

  storeLegalName: string;
  storeVAT: string;
  storeFullAddress: string;
  storeZipCode: string;
  storeCity: string;

  tipAmount: number;
  usedRewardAmount: number;

  comment: string;

  rewardTransactionId: string;
  rewardTransaction: RewardTransaction;
  woltDeliveryInfo: WoltDeliveryInfo;
}
