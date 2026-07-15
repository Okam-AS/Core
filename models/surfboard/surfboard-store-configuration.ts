// Per-store Surfboard configuration as returned by GET /stores/{id}/surfboard-configuration.
// Mirrors the backend SurfboardStoreConfigurationModel. WebhookSecret is only returned to KAM /
// PowerUsers. ApplicationId / OnboardingStatus track an in-flight API onboarding (WP4).
export class SurfboardStoreConfiguration {
  id: number;
  merchantId: string | null;
  storeExternalId: string | null;
  onlineTerminalId: string | null;
  webhookSecret: string | null;
  applicationId: string | null;
  onboardingStatus: string | null;
  cardEnabled: boolean;
  vippsEnabled: boolean;
  mobilePayEnabled: boolean;
  swishEnabled: boolean;
  klarnaEnabled: boolean;
  tipsEnabled: boolean;
  // Rollout gate: split bills as Surfboard partial payments (one bill-level order, one payment per
  // portion). Off until the store has passed a physical terminal test.
  partialPaymentsEnabled: boolean;
  commissionPercentage: number;
  terminalCommissionPercentage: number;
  woltDeliveryFeePercent: number;
  woltCustomerDeliveryFeeAmount: number;
  woltServiceFeeAmount: number;
}
