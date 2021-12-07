import { OrderStatus, DeliveryType } from '~/core/enums'
import { OrderLineItem, TaxDetail } from '~/core/models'
export class Order {
    id: string;
    userId: string;
    storeId: string;
    pickup: Date;
    created: Date;
    completed: Date;
    status: OrderStatus;
    items: Array<OrderLineItem>;
    taxDetails: Array<TaxDetail>;

    tableName: string;
    dateTimeNow: Date;
    countdownEndTime: Date;

    itemsAmount: number;
    itemsAmountLineThrough: number;
    orderDiscountAmount: number;
    deliveryAmount: number;
    finalAmount: number;

    isWaiterOrder: boolean;
    deliveryType: DeliveryType;
    fullAddress: string;
    zipCode: string;
    city: string;

    storeLegalName: string;
    storeVAT: string;
    storeFullAddress: string;
    storeZipCode: string;
    storeCity: string;

    comment: string;
}