import { OrderStatus, DeliveryType, PaymentType, DineHomeStatus } from "../../enums";
import { OrderLineItem, TaxDetail, WoltDeliveryInfo } from "../../models";

export class Order {
  id: string;
  friendlyOrderId: string;
  dineHomeOrderId: string;

  created: Date;
  requestedCompletion: Date;
  processingStartTime: Date;
  estimatedProcessingEndTime: Date;
  processingEndTime: Date;
  completed: Date;
  isInPreorderMode: boolean;

  platform: string;
  userId: string;
  storeId: number;
  status: OrderStatus;
  dineHomeStatus: DineHomeStatus;
  items: Array<OrderLineItem>;
  taxDetails: Array<TaxDetail>;

  paymentIntentId: string;
  vippsOrderId: string;

  tableName: string;
  dateTimeNow: Date;
  countdownEndTime: Date;
  pickup: Date;

  itemsAmount: number;
  itemsAmountLineThrough: number;
  orderDiscountAmount: number;
  deliveryAmount: number;
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

  userIsMember: boolean;
  userFullName: string;

  tipAmount: number;

  comment: string;
  woltDeliveryInfo: WoltDeliveryInfo;
}
