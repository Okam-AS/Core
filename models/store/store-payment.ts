export class StorePayment {
  payInStoreEnabled?: boolean;

  stripeEnabled?: boolean;
  stripeBankAccountId: string;

  vippsEnabled?: boolean;
  vippsMsn: string;

  giftcardEnabled?: boolean;
  giftcardBankAccountNumber: string;
  sendInvoiceToEmails: string;

  dinteroEnabled?: boolean;
  dinteroBillieEnabled?: boolean;
  dinteroKlarnaEnabled?: boolean;
}
