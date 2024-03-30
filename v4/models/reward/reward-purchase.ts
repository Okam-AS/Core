import { RewardPurchaseStatus, PaymentType } from "../../enums";
import { RewardTransaction, RewardProgram } from "../";

export class RewardPurchase {
  rewardPurchaseId?: string;

  platform: string;
  created: Date;
  completed?: Date;

  status: RewardPurchaseStatus;
  paymentType: PaymentType;

  buyerUserId: string;
  buyerPhoneNumber: string;
  buyerMessageToReceiver: string;

  sendToAFriend: boolean;
  receiverUserId: string;
  receiverPhoneNumber: string;

  storeId: number;
  storeLegalName: string;
  storeVAT: number;
  storeFullAddress: string;
  storeZipCode: string;
  storeCity: string;

  smsCount: number;
  smsFee: number;
  applicationFeeAmount: number;
  applicationFeePercent: number;
  totalFeeAmount: number;
  paymentIntentId: string;
  vippsOrderId: string;
  finalAmount: number;

  rewardTransactionId?: string;
  rewardTransaction?: RewardTransaction;

  rewardProgramId?: string;
  rewardProgram?: RewardProgram;
}
