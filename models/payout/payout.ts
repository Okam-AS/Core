export class Payout {
    OkamPayoutId: number;
    Requested: Date | null;
    Payed: Date | null;
    PayoutAmount: number;
    NumberOfOrders: number;
    InvoiceFee: number;
    Commission: number;
    PreviousPayout: Date | null;
    StoreId: number;
    Store: any;
    InvoiceId: number | null;
    Invoice: any;
}