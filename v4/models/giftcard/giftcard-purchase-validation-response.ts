export class GiftcardPurchaseValidationResponse {
  giftcardId: string;
  storeNotFound: boolean;
  giftcardNotFound: boolean;
  amountError: boolean;
  userNotBuyer: boolean;
  paymentTypeError: boolean;
  alreadyCompleted: boolean;
  receiverPhoneNumberNotValid: boolean;
  receiverPhoneNumberNotAUser: boolean;
  hasErrors: boolean;
}
