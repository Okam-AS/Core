import { RewardStore, RewardMembership } from "..";

export class RewardCard {
  name: string;
  cashbackPercent: number;
  stores: RewardStore[];
  rewardMembership: RewardMembership;
  balance: number;
}
