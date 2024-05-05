import { Store, RewardMembership, RewardCachbackRange } from "..";

export class RewardProgram {
  rewardProgramId: string;
  name: string;
  cashbackEnabled: boolean;
  cutOffDaysForRewardCalculation: number;
  cashbackRanges: Array<RewardCachbackRange>;
  stores: Array<Store>;
  memberships: Array<RewardMembership>;
}
