import { Address, Category, DeliveryMethod, OpeningHour, User, StorePayment, StoreTip, RewardProgram, DinteroStoreConfiguration } from "../../models";
export class Store {
  id: number;
  name: string;
  slug: string;
  termsUrl: string;
  legalName: string;
  phoneNumber: string;
  logoUrl: string;
  feedbackUrl: string;
  feedbackMessage: string;
  address: Address;
  homeDeliveryFromAddress: Address;
  categories: Array<Category>;
  // ISO-4217 charge currency for this store's region (e.g. "NOK", "CHF"), server-driven.
  // Optional/additive: absent on legacy (NOK) responses, so consumers must default to "NOK".
  currencyCode?: string;
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
  dineHomeOutletId: string;

  rewardProgramId: string;
  rewardProgram: RewardProgram;

  warningMessage: string;
  statusMessage: string;

  selfPickUp: boolean;
  tableDeliveryEnabled: boolean;
  homeDeliveryEnabled: boolean;
  dineHomeDeliveryEnabled: boolean;
  woltDriveEnabled: boolean;
  woltDriveIsConfigured: boolean;

  payment: StorePayment;

  tip: StoreTip;

  dinteroStoreConfiguration: DinteroStoreConfiguration;
}
