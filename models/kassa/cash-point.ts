export class CashPoint {
  cashPointId: number;
  storeId: number;
  name: string;
  registerId: string;
  dinteroStoreId: string;
  dinteroTerminalId: string;
  dinteroPayoutDestinationId: string;
  dinteroProfileId: string;
  surfboardTerminalId: string;
  surfboardAutoPrintReceipt: boolean;
  isActive: boolean;
  grandTotalSales: number;
  grandTotalReturns: number;
  grandTotalNet: number;
  grandTotalTips: number;
  maxCashDifference: number;
  created: Date;
}

export class CashPointUpsertModel {
  storeId: number;
  name: string;
  registerId: string;
  dinteroStoreId: string;
  dinteroTerminalId: string;
  dinteroPayoutDestinationId: string;
  dinteroProfileId: string;
  surfboardTerminalId: string;
  surfboardAutoPrintReceipt: boolean;
  isActive: boolean;
  maxCashDifference: number;
}
