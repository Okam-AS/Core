import { StatisticQueryOrders, StatisticChart, OrderSummaryItem } from '../index'

export class StatisticOrders {
    filter: StatisticQueryOrders;
    charts: Array<StatisticChart>;
    ordersSummary: Array<OrderSummaryItem>;
}
