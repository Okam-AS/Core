import { KassaReceiptType, PaymentType } from '../../enums';

export class PosReceiptModel {
  journalEntryId: number;
  title: string;
  receiptType: KassaReceiptType | null;
  markingText: string | null;
  receiptNumber: number | null;
  sequenceNumber: number;
  copyNumber: number | null;
  registerId: string;
  cashPointId: number;
  operatorId: number;
  operatorName: string;
  sellerLegalName: string;
  sellerOrgNumber: string;
  sellerAddress: string;
  localDate: string;
  localTime: string;
  timestamp: Date;
  currency: string;
  lines: Array<PosReceiptLineModel>;
  taxLines: Array<PosReceiptTaxLineModel>;
  payments: Array<PosReceiptPaymentLineModel>;
  grossAmount: number;
  netAmount: number;
  vatAmount: number;
  roundingAmount: number;
  tipAmount: number;
  tenderedAmount: number;
  changeAmount: number;
  isTraining: boolean;
  isVoid: boolean;
  referencedReceiptNumber: number | null;
  signature: string;
  keyVersion: string;
}

export class PosReceiptLineModel {
  lineNumber: number;
  productName: string;
  articleId: string;
  quantity: number;
  unitAmount: number;
  lineAmount: number;
  vatPercent: number;
  vatAmount: number;
  depositAmount: number;
  options: string;
  discountAmount: number;
  discountReason: string | null;
}

export class PosReceiptTaxLineModel {
  vatPercent: number;
  basis: number;
  amount: number;
}

export class PosReceiptPaymentLineModel {
  paymentType: PaymentType;
  amount: number;
}
