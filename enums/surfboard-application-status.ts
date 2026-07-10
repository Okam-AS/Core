// Surfboard KYB application lifecycle (from the Merchants API). MerchantCreated (or Completed) means
// the merchant + store ids are available; Rejected / Expired are terminal failures.
export enum SurfboardApplicationStatus {
  Initiated = "APPLICATION_INITIATED",
  Submitted = "APPLICATION_SUBMITTED",
  PendingInformation = "APPLICATION_PENDING_INFORMATION",
  Signed = "APPLICATION_SIGNED",
  Rejected = "APPLICATION_REJECTED",
  Expired = "APPLICATION_EXPIRED",
  Completed = "APPLICATION_COMPLETED",
  MerchantCreated = "MERCHANT_CREATED"
}
