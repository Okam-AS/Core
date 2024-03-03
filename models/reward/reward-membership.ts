import { RewardProgram, User } from '../../models';

export class RewardMembership {
    rewardProgramId: string;
    rewardProgram: RewardProgram;

    userId: string;
    user: User;

    acceptedOffersNotifications: Date | null;
    acceptedOffersNotificationsValue: boolean | null;

    acceptedNewsNotifications: Date | null;
    acceptedNewsNotificationsValue: boolean | null;

    acceptedRewardsTerms: Date | null;
    acceptedRewardsTermsValue: boolean | null;

    collectRewards: boolean;
}
