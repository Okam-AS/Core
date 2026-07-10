import { KassaEventType, KassaReceiptType, SafTVatCode, PaymentType } from "../../enums";

export class JournalLine {
  journalLineId: number;
  journalEntryId: number;
  lineNumber: number;
  productId: string | null;
  productName: string;
  articleId: string;
  goodsGroupCode: string;
  goodsGroupName: string;
  quantity: number;
  unitAmount: number;
  lineAmount: number;
  vatPercent: number;
  vatCode: SafTVatCode;
  vatAmount: number;
  depositAmount: number;
  optionsFlattened: string;
  isOpenPrice: boolean;
  discountAmount: number;
  discountReason: string;
  operatorId: number;
}

export class JournalTaxLine {
  journalTaxLineId: number;
  journalEntryId: number;
  vatPercent: number;
  vatCode: SafTVatCode;
  basis: number;
  amount: number;
}

export class JournalPaymentLine {
  journalPaymentLineId: number;
  journalEntryId: number;
  paymentType: PaymentType;
  amount: number;
  paymentTransactionId: string | null;
  cashDrawerTransactionId: number | null;
}

export class JournalEntry {
  journalEntryId: number;
  cashPointId: number;
  storeId: number;
  sequenceNumber: number;
  eventType: KassaEventType;
  receiptType: KassaReceiptType | null;
  receiptNumber: number | null;
  timestamp: Date;
  operatorId: number;
  operatorName: string;
  orderId: number | null;
  grossAmount: number;
  netAmount: number;
  vatAmount: number;
  roundingAmount: number;
  tipAmount: number;
  isTraining: boolean;
  isVoid: boolean;
  referencedReceiptNumber: number | null;
  signature: string;
  previousSignature: string;
  keyVersion: string;
  canonicalData: string;
  lines: Array<JournalLine>;
  taxLines: Array<JournalTaxLine>;
  paymentLines: Array<JournalPaymentLine>;
}

export class JournalEntryPageModel {
  page: number;
  pageSize: number;
  totalCount: number;
  entries: Array<JournalEntry>;
}

export class JournalSignatureRecord {
  journalEntryId: number;
  sequenceNumber: number;
  previousSignature: string;
  signature: string;
  canonicalData: string;
  keyVersion: string;
}
