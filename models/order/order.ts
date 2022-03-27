import { OrderStatus, DeliveryType, PaymentType} from '../../enums'
import { OrderLineItem, TaxDetail } from '../../models'
export class Order {
    id: string;
    friendlyOrderId: string;

    requestedCompletion: Date;

    platform: string;
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

    paymentType: PaymentType;
    deliveryType: DeliveryType;

    fullAddress: string;
    zipCode: string;
    city: string;

    storeLegalName: string;
    storeVAT: string;
    storeFullAddress: string;
    storeZipCode: string;
    storeCity: string;

    tipAmount: number;

    comment: string;
}