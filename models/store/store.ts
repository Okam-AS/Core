import { Address, Category, DeliveryMethod, OpeningHour, User } from '../../models'

export class Store {
    id: number;
    name: string;
    phoneNumber: string;
    logoUrl: string;
    address: Address;
    categories: Array<Category>;
    openingHours: Array<OpeningHour>;
    isOpenNow: boolean;
    admins: Array<User>;
    editors: Array<User>;
    homeDeliveryMethods: Array<DeliveryMethod>;
    approved: boolean;
    selfCheckout: boolean;
    selfPickUp: boolean;
    tableDelivery: boolean;
    registered: Date;
    bankAccountId: string;
    minimumOrderPriceForHomeDelivery: number;
}