import { OrderStatusFilter, DeliveryType } from '~/core/enums'

export class StatisticQueryOrders {
    storeId: number;
    from: string;
    to: string;
    statuses: Array<OrderStatusFilter>;
    deliveryTypes: Array<DeliveryType>;
    includeItems: boolean;
}
