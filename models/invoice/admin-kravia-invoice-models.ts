import { InvoiceChannel, InvoiceCustomerKind, InvoiceIssueStatus, InvoiceSendMethod } from '../../enums';
import { Order } from '../order/order';

// A Brreg hit returned by the Kravia company lookup.
export class AdminKraviaCompany {
  organizationNumber: string;
  name: string;
  fullAddress: string;
  zipCode: string;
  city: string;
}

// A previously invoiced company, derived from past orders. Superseded by InvoiceCustomer.
export class AdminKraviaCompanyHistory {
  organizationNumber: string;
  companyName: string;
  companyAddress: string;
  companyZipCode: string;
  companyCity: string;
  phone: string;
  email: string;
  referenceFirstName: string;
  referenceLastName: string;
  lastOrderId: string;
  lastOrderedAt: Date | null;
}

export class AdminKraviaInvoiceLineRequest {
  productId: string | null;
  productName: string;
  quantity: number;
  unitPriceExVat: number;
  discountPercent: number;
  // VAT percent, not money.
  vatRate: number;
}

export class AdminKraviaInvoiceRequest {
  storeId: number;
  // An existing recipient to invoice. When set, the stored customer wins over the fields below —
  // it is the row carrying the accounting system's customer id.
  invoiceCustomerId?: number | null;
  // Company is the default and the only thing Kravia issues; Person is accepted only when the
  // store's invoice channel is its accounting system.
  kind?: InvoiceCustomerKind;
  // The person's name/address. Company recipients use the company* fields instead.
  name?: string;
  address?: string;
  zipCode?: string;
  city?: string;
  organizationNumber?: string;
  companyName?: string;
  companyAddress?: string;
  companyZipCode?: string;
  companyCity?: string;
  referenceFirstName?: string;
  referenceLastName?: string;
  phone?: string;
  email?: string;
  manualInvoice?: boolean;
  requestedCompletion?: string | null;
  lines: Array<AdminKraviaInvoiceLineRequest>;
}

export class AdminKraviaInvoiceResult {
  success: boolean;
  orderId: string;
  friendlyOrderId: string;
  // Kravia's external id is the Dintero transaction id; an accounting-system invoice has none.
  dinteroTransactionId: string | null;
  invoiceNumber: string | null;
  invoiceUrl: string | null;
  // Which channel issued it, so the admin screen can say "sendt via Tripletex".
  invoiceChannel: InvoiceChannel | null;
  invoiceIssueStatus: InvoiceIssueStatus;
  invoiceDispatchMethod: InvoiceSendMethod | null;
  invoiceCustomerId: number | null;
  requestedCompletion: Date | null;
  order: Order;
}
