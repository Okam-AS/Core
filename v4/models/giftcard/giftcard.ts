import { GiftcardStatus, PaymentType } from "../../enums";
import { GiftcardTransaction } from "../";

export class Giftcard {
  giftcardId?: string;

  platform: string;
  created: Date;
  completed?: Date;

  status: GiftcardStatus;
  paymentType: PaymentType;

  buyerUserId: string;
  buyerPhoneNumber: string;
  buyerMessageToReceiver: string;

  sendToAFriend: boolean;
  receiverUserId: string;
  receiverPhoneNumber: string;

  storeId: number;
  storeLegalName: string;
  storeVAT: number;
  storeFullAddress: string;
  storeZipCode: string;
  storeCity: string;

  smsCount: number;
  smsFee: number;
  applicationFeeAmount: number;
  applicationFeePercent: number;
  totalFeeAmount: number;
  paymentIntentId: string;
  vippsOrderId: string;
  finalAmount: number;

  giftcardTransactionId?: string;
  giftcardTransaction?: GiftcardTransaction;
}
