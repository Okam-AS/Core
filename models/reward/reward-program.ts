import { RewardMembership, RewardCachbackRange } from '..';

export class RewardProgram {
    rewardProgramId: string;
    name: string;
    cashbackEnabled: boolean;
    cashbackRanges: Array<RewardCachbackRange>;
    memberships: Array<RewardMembership>;

    cutOffDaysForRewardCalculation: number;

    averageOrderCountForNonMembers: number;
    averageOrderCountForMembers: number;
    averageSpentForNonMembers: number;
    averageSpentForMembers: number;
}
