export class RewardPurchaseValidationResponse {
    rewardPurchaseId: string;
    storeNotFound: boolean;
    rewardProgramNotFound: boolean;
    amountError: boolean;
    userNotBuyer: boolean;
    paymentTypeError: boolean;
    alreadyCompleted: boolean;
    receiverPhoneNumberNotValid: boolean;
    receiverPhoneNumberNotAUser: boolean;
    receiverPhoneNumberNotARewardMember: boolean;
    hasErrors: boolean;
}
