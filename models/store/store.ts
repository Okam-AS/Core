import { Address, Category, DeliveryMethod, OpeningHour, User, StorePayment, StoreTip } from '../../models'
export class Store {
    id: number;
    name: string;
    legalName: string;
    phoneNumber: string;
    logoUrl: string;
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

    warningMessage: string;
    statusMessage: string;

    selfPickUp: boolean;
    tableDeliveryEnabled: boolean;
    homeDeliveryEnabled: boolean;

    payment: StorePayment;

    tip: StoreTip
}