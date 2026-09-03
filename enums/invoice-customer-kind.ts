// Person is reachable only through the accounting-system channel: Kravia is B2B and rejects a
// recipient without an organisation number.
export enum InvoiceCustomerKind {
  Company = 'Company',
  Person = 'Person'
}
