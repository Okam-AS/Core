import { RewardMembership, Order } from '..';
import { RewardTransactionType } from '../../enums';

export class RewardTransaction {
    rewardTransactionId: string;
    created: Date;
    amount: number;
    rewardTransactionType: RewardTransactionType;

    rewardMembershipId: string;
    rewardMembership: RewardMembership;

    orderId: number | null;
    order: Order | null;
}