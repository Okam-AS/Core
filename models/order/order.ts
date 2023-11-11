import { OrderStatus, DeliveryType, PaymentType } from '../../enums'
import { OrderLineItem, TaxDetail } from '../../models'
export class Order {
    id: string;
    friendlyOrderId: string;

    created: Date;
    requestedCompletion: Date;
    processingStartTime: Date;
    estimatedProcessingEndTime: Date;
    processingEndTime: Date;
    completed: Date;

    platform: string;
    userId: string;
    storeId: string;
    status: OrderStatus;
    items: Array<OrderLineItem>;
    taxDetails: Array<TaxDetail>;

    paymentIntentId: string;
    vippsOrderId: string;

    tableName: string;
    dateTimeNow: Date;
    countdownEndTime: Date;
    pickup: Date;

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