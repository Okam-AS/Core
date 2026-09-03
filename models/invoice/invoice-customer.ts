import { InvoiceCustomerKind } from '../../enums';

// A stored invoice recipient for one store. It is the row that carries the accounting system's own
// customer id, so an existing customer is reused rather than re-typed (re-typing risks a duplicate
// customer there).
export class InvoiceCustomer {
  id: number;
  storeId: number;
  kind: InvoiceCustomerKind;
  organizationNumber: string;
  name: string;
  address: string;
  zipCode: string;
  city: string;
  email: string;
  phone: string;
  referenceFirstName: string;
  referenceLastName: string;
  externalAccountingCustomerId: string;
  lastInvoicedAt: Date | null;
}

export class UpsertInvoiceCustomerModel {
  // Set to update a known person; a company is keyed by its organisation number instead.
  id?: number;
  kind: InvoiceCustomerKind;
  organizationNumber?: string;
  name: string;
  address?: string;
  zipCode?: string;
  city?: string;
  email?: string;
  phone?: string;
  referenceFirstName?: string;
  referenceLastName?: string;
}

// A Brreg hit, shaped for prefilling a new company customer.
export class InvoiceCustomerLookup {
  organizationNumber: string;
  name: string;
  fullAddress: string;
  zipCode: string;
  city: string;
}
