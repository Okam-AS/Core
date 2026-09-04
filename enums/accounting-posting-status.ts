// Outcome recorded for a posting.
export enum AccountingPostingStatus {
  Posted = 'Posted',
  Failed = 'Failed',
  Reversed = 'Reversed',
  Skipped = 'Skipped',
  // Claimed by a run that has not yet posted.
  Pending = 'Pending',
  // The provider refused the posting because its accounting period is closed. NOT retryable: only
  // a human, in the provider's own product, can reopen the period.
  PeriodLocked = 'PeriodLocked'
}
