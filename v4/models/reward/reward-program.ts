import { Store, RewardMembership, AvailableRewardPurchaseAmount } from '..';

export class RewardProgram {
    rewardProgramId: string;
    name: string;
    cashbackEnabled: boolean;
    cashbackPercent: number;
    stores: Array<Store>;
    rewardMemberships: Array<RewardMembership>;
    availableRewardPurchaseAmounts: Array<AvailableRewardPurchaseAmount>
}
