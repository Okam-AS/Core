import { PaymentType } from "../../enums";

export class InitiateGiftcardPurchase {
  paymentType: PaymentType;
  buyerMessageToReceiver: string;
  receiverPhoneNumber: string;
  finalAmount: number;
}
