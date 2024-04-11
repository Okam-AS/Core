import { Order } from "..";
import { RewardTransactionType } from "../../enums";

export class RewardTransaction {
  rewardTransactionId: string;
  created: Date;
  amount: number;
  type: RewardTransactionType;

  orderId: number | null;
  order: Order | null;
}
