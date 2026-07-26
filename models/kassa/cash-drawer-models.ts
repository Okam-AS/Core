import { CashDrawerTransactionType, PosReasonType } from '../../enums';

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
  // Predefined reason for any cash difference (§ 5-3-14). Required for ANY non-zero difference.
  // differenceText is the operator's free-text note, only required when differenceReasonType is Annet.
  differenceReasonType: PosReasonType;
  differenceText: string | null;
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
  // A reason is required whenever difference !== 0 (§ 5-3-14). outOfTolerance is a separate signal
  // for the |difference| > maxCashDifference warning.
  explanationRequired: boolean;
  outOfTolerance: boolean;
  differenceReasonType: PosReasonType | null;
  differenceExplanation: string | null;
  eodReceiptEmail: string | null;
  // The Z report the close produced; null only if the Z has to be run standalone after a failure.
  zReportId: number | null;
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
  differenceReasonType: PosReasonType | null;
  differenceExplanation: string | null;
  eodReceiptEmail: string | null;
  transactions: Array<CashDrawerTransaction>;
}
