import { RewardStore, RewardMembership } from '..';

export class RewardCard {
	public name: string;
	public cashbackPercent: number;
	public stores: RewardStore[];
	public rewardMembership: RewardMembership;
	public balance: number;
}