import { PaymentType } from '../../enums';

export class InitiatePurchaseReward {
    rewardProgramId: string;
    paymentType: PaymentType;
    sendToAFriend: boolean;
    buyerMessageToReceiver: string;
    receiverPhoneNumber: string;
    storeId: number;
    rewardAmount: number;
    finalAmount: number;
}
