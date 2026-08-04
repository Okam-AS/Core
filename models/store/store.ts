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
  // Read-only Marketplace status; tokens are stored server-side and never returned.
  woltMarketplaceConfiguration: { enabled: boolean; venueId: string; merchantPortalUrl: string };

  payment: StorePayment;

  tip: StoreTip;

  dinteroStoreConfiguration: DinteroStoreConfiguration;
}
