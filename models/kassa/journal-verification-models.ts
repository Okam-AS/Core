export class JournalVerificationIssue {
  journalEntryId: number;
  sequenceNumber: number;
  reason: string;
}

export class JournalVerificationResult {
  cashPointId: number;
  entryCount: number;
  fromSequenceNumber: number;
  toSequenceNumber: number;
  sequenceGapless: boolean;
  chainLinked: boolean;
  signaturesValid: boolean;
  verified: boolean;
  message: string;
  issues: Array<JournalVerificationIssue>;
}
