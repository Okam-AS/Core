import { OrderSummaryItemOption } from './order-summary-item-option'

export class OrderSummaryItem {
    quantity: number;
    name: string;
    currency: string;
    amount: number;
    options: Array<OrderSummaryItemOption>;
}
