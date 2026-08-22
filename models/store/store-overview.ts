import { KeyAccountManagerStatus } from '../../enums/key-account-manager-status'

export class StoreOverviewModel {
  public storeId: number;
  public name: string;
  public orderCount: number;

  /** Integer minor units (øre) — format with the shared priceLabel helper. */
  public totalAmount: number;
  public approved: boolean;

  // Only populated for key account managers and power users.
  public kamUserId: string;
  public kamUserName: string;
  public kamStatus: KeyAccountManagerStatus;
  public kamNotes: string;
  public firstAdmin: string;
  public adminCount: number;
}
