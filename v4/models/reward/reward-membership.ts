import { RewardProgram, User, RewardTransaction } from '../../models';

export class RewardMembership {
    rewardMembershipId: string;

    rewardProgramId: string | null;
    rewardProgram: RewardProgram | null;

    userId: string;
    user: User;

    acceptedOffersNotifications: Date | null;
    acceptedOffersNotificationsValue: boolean | null;

    acceptedNewsNotifications: Date | null;
    acceptedNewsNotificationsValue: boolean | null;

    acceptedRewardsTerms: Date | null;
    acceptedRewardsTermsValue: boolean | null;

    rewardTransactions: RewardTransaction[] = [];

    collectRewards: boolean;
}
