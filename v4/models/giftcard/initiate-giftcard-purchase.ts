import { PaymentType } from "../../enums";

export class InitiateGiftcardPurchase {
  giftcardId: string;
  paymentType: PaymentType;
  sendToAFriend: boolean;
  buyerMessageToReceiver: string;
  receiverPhoneNumber: string;
  storeId: number;
  finalAmount: number;
}
