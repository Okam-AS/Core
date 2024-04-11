import { Order, Giftcard } from "..";
import { GiftcardTransactionType } from "../../enums";

export class GiftcardTransaction {
  giftcardTransactionId: string;
  created: Date;
  amount: number;
  type: GiftcardTransactionType;

  giftcardId: string;
  giftcard: Giftcard;

  orderId: number | null;
  order: Order | null;
}
