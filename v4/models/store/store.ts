import { Address, Category, DeliveryMethod, OpeningHour, User, StorePayment, StoreTip, RewardProgram } from "../../models";
export class Store {
  id: number;
  name: string;
  legalName: string;
  phoneNumber: string;
  logoUrl: string;
  feedbackUrl: string;
  feedbackMessage: string;
  address: Address;
  homeDeliveryFromAddress: Address;
  categories: Array<Category>;
  allowOrdersAfterOpeningHours: boolean;
  openingHours: Array<OpeningHour>;
  isOpenNow: boolean;
  vat: number;
  admins: Array<User>;
  editors: Array<User>;
  homeDeliveryMethods: Array<DeliveryMethod>;
  approved: boolean;
  selfCheckout: boolean;
  registered: Date;
  bankAccountId: string;
  vippsMsn: string;
  minimumOrderPriceForHomeDelivery: number;

  rewardProgramId: string;
  rewardProgram: RewardProgram;

  warningMessage: string;
  statusMessage: string;

  selfPickUp: boolean;
  tableDeliveryEnabled: boolean;
  homeDeliveryEnabled: boolean;
  dineHomeDeliveryEnabled: boolean;

  dineHomeOutletId: string;

  payment: StorePayment;

  tip: StoreTip;
}
