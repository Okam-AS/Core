import { CashDrawerTransactionType } from '../../enums';

export class BeginDayRequest {
  startFloat: number;
}

export class CashDrawerTransactionRequest {
  type: CashDrawerTransactionType;
  amount: number;
}

export class EndDayRequest {
  endCountedAmount: number;
  bankDepositAmount: number;
  differenceExplanation: string | null;
  email: string | null;
}

export class EodSummaryModel {
  cashDrawerSessionId: number;
  cashPointId: number;
  registerId: string | null;
  storeId: number;
  storeName: string | null;
  storeLegalName: string | null;
  orgNumber: string | null;
  operatorId: number;
  operatorName: string | null;
  openedAt: Date;
  closedAt: Date | null;
  localDate: string | null;
  localTime: string | null;
  isClosed: boolean;
  startFloat: number;
  expectedCashAmount: number;
  countedAmount: number | null;
  difference: number | null;
  bankDepositAmount: number;
  cardTotal: number;
  otherTotal: number;
  cashTotal: number;
  maxCashDifference: number;
  explanationRequired: boolean;
  differenceExplanation: string | null;
  eodReceiptEmail: string | null;
}

export class CashDrawerTransaction {
  cashDrawerTransactionId: number;
  cashDrawerSessionId: number;
  type: CashDrawerTransactionType;
  amount: number;
  operatorId: number;
  journalEntryId: number | null;
  idempotencyKey: string | null;
  timestamp: Date;
}

export class CashDrawerSession {
  cashDrawerSessionId: number;
  cashPointId: number;
  startFloat: number;
  startOperatorId: number;
  openedAt: Date;
  endCountedAmount: number | null;
  endOperatorId: number | null;
  closedAt: Date | null;
  expectedAmount: number | null;
  difference: number | null;
  bankDepositAmount: number | null;
  differenceExplanation: string | null;
  eodReceiptEmail: string | null;
  transactions: Array<CashDrawerTransaction>;
}
