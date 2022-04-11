import { OrderStatusFilter, DeliveryType, OrderPaymentTypeFilter } from '../../enums'

export class StatisticQueryOrders {
    storeId: number;
    from: string;
    to: string;
    statuses: Array<OrderStatusFilter>;
    paymentTypes: Array<OrderPaymentTypeFilter>;
    deliveryTypes: Array<DeliveryType>;
    includeItems: boolean;
}
