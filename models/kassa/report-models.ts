import { PaymentType, SafTVatCode } from "../../enums";

export class PaymentMeansTotal {
  paymentType: PaymentType;
  count: number;
  amount: number;
}

export class VatRateTotal {
  vatPercent: number;
  vatCode: SafTVatCode;
  basis: number;
  amount: number;
}

export class OperatorTotal {
  operatorId: number;
  operatorName: string;
  salesCount: number;
  salesAmount: number;
  returnsCount: number;
  returnsAmount: number;
}

export class XReportModel {
  cashPointId: number;
  registerId: string;
  storeId: number;
  fromSequenceNumber: number;
  toSequenceNumber: number;
  previousZNumber: number;
  generatedAt: Date;
  localDate: string;
  localTime: string;
  salesCount: number;
  salesAmount: number;
  salesNetAmount: number;
  salesVatAmount: number;
  tipsAmount: number;
  returnsCount: number;
  returnsAmount: number;
  discountCount: number;
  discountAmount: number;
  correctionCount: number;
  correctionAmount: number;
  receiptCount: number;
  drawerOpenCount: number;
  manualDrawerOpenCount: number;
  copyReceiptCount: number;
  provisionalReceiptCount: number;
  trainingCount: number;
  trainingAmount: number;
  abortedSalesCount: number;
  abortedSalesAmount: number;
  cashTotal: number;
  cardTotal: number;
  otherTotal: number;
  paymentMeans: Array<PaymentMeansTotal>;
  vatRates: Array<VatRateTotal>;
  operators: Array<OperatorTotal>;
  grandTotalSales: number;
  grandTotalReturns: number;
  grandTotalNet: number;
  grandTotalTips: number;
}

export class ZReportModel extends XReportModel {
  zReportId: number;
  zNumber: number;
  cashDrawerSessionId: number | null;
  startFloat: number | null;
  cashExpected: number | null;
  cashCounted: number | null;
  cashDifference: number | null;
  differenceExplanation: string;
  bankDepositAmount: number | null;
  signature: string;
  keyVersion: string;
}
