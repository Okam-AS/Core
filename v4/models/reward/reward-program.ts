import { RewardBarData, RewardMembership, RewardCachbackRange, Store } from "..";

export class RewardProgram {
  rewardProgramId: string;
  name: string;
  cashbackEnabled: boolean;
  cutOffDaysForRewardCalculation: number;
  cashbackRanges: Array<RewardCachbackRange>;
  cashbackRangeToString: string;
  stores: Array<Store>;
  memberships: Array<RewardMembership>;
  rewardBarData: Array<RewardBarData>;
}
