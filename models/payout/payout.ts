export class Payout {
    okamPayoutId: number;
    requested: Date | null;
    payed: Date | null;
    payoutAmount: number;
    numberOfOrders: number;
    invoiceFee: number;
    commission: number;
    previousPayout: Date | null;
    storeId: number;
    store: any;
    invoiceSent: boolean;
    invoiceId: number | null;
    invoice: any;
    storeBankAccountNumber: string;
}