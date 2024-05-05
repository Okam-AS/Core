import { Store, RewardMembership, RewardCachbackRange } from "..";

export class RewardProgram {
  rewardProgramId: string;
  name: string;
  cashbackEnabled: boolean;
  cashbackRanges: Array<RewardCachbackRange>;
  stores: Array<Store>;
  memberships: Array<RewardMembership>;
}
