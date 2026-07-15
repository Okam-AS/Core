import { PaymentType, SafTVatCode } from "../../enums";

export class PaymentMeansTotal {
  paymentType: PaymentType;
  count: number;
  amount: number;
}

// Net turnover for one goods group over the period (Gruppe | Antall | Omsetn. | Rabatt).
export class GoodsGroupTotal {
  code: string | null;
  name: string | null;
  quantity: number;
  amount: number;
  discountAmount: number;
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
  // Enterprise identity (§ 2-8-2 bokstav b) and the trading day's opening change float
  // (bokstav k; the open day's float on an X, the settled day's on a Z).
  sellerLegalName: string;
  sellerOrgNumber: string;
  startFloat: number | null;
  salesCount: number;
  salesAmount: number;
  salesNetAmount: number;
  salesVatAmount: number;
  tipsCount: number;
  tipsAmount: number;
  // returnsCount/Amount = all RETREC; the two buckets below split it into referenced returns
  // ("Retur") and unreferenced negative sales ("Negativ salg").
  returnsCount: number;
  returnsAmount: number;
  referencedReturnsCount: number;
  referencedReturnsAmount: number;
  negativeSalesCount: number;
  negativeSalesAmount: number;
  discountCount: number;
  discountAmount: number;
  correctionCount: number;
  correctionAmount: number;
  receiptCount: number;
  drawerOpenCount: number;
  manualDrawerOpenCount: number;
  copyReceiptCount: number;
  copyReceiptAmount: number;
  provisionalReceiptCount: number;
  provisionalReceiptAmount: number;
  trainingCount: number;
  trainingAmount: number;
  lineCorrectionCount: number;
  lineCorrectionAmount: number;
  abortedSalesCount: number;
  abortedSalesAmount: number;
  cashTotal: number;
  cardTotal: number;
  otherTotal: number;
  paymentMeans: Array<PaymentMeansTotal>;
  goodsGroups: Array<GoodsGroupTotal>;
  vatRates: Array<VatRateTotal>;
  operators: Array<OperatorTotal>;
  grandTotalSales: number;
  grandTotalReturns: number;
  grandTotalNegativeSales: number;
  grandTotalErrors: number;
  grandTotalNet: number;
  grandTotalTips: number;
}

export class ZReportModel extends XReportModel {
  zReportId: number;
  zNumber: number;
  cashDrawerSessionId: number | null;
  cashExpected: number | null;
  cashCounted: number | null;
  cashDifference: number | null;
  differenceExplanation: string;
  bankDepositAmount: number | null;
  signature: string;
  keyVersion: string;
}

// Paged read-back history of persisted Z reports for a cash point.
export class ZReportPageModel {
  page: number;
  pageSize: number;
  totalCount: number;
  reports: Array<ZReportModel>;
}
