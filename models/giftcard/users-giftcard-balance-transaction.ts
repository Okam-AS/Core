import { GiftcardTransactionType } from "../../enums";

export class UsersGiftcardBalanceTransaction {
  title: string;
  created: Date;
  amount: number;
  type: GiftcardTransactionType;
  buyerPhoneNumber: string;
  buyerMessageToReceiver: string;
}
