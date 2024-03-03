import { Store, RewardMembership } from '..';

export class RewardProgram {
    rewardProgramId: string;
    name: string;
    cashbackEnabled: boolean;
    cashbackPercent: number;
    stores: Array<Store>;
    rewardMemberships: Array<RewardMembership>;
}
