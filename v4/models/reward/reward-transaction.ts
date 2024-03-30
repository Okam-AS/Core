import { RewardMembership, Order, RewardPurchase } from "..";
import { RewardTransactionType } from "../../enums";

export class RewardTransaction {
  rewardTransactionId: string;
  created: Date;
  amount: number;
  rewardTransactionType: RewardTransactionType;

  rewardMembershipId: string;
  rewardMembership: RewardMembership;

  rewardPurchaseId: string;
  rewardPurchase: RewardPurchase;

  orderId: number | null;
  order: Order | null;
}
