
export class KamUserModel {
  public id: string
  public name: string
  public phoneNumber: string

  /**
   * Commission this KAM earned on agreements ACCEPTED inside the requested period.
   * Integer minor units (øre) — format with the shared priceLabel helper, never by hand.
   */
  public onetimeBonusEarned: number

  /**
   * Recurring commission per month that the period's signatures ADDED — a run-rate, not
   * money earned in the period. Nothing bills a restaurant yet, so no payment exists to
   * attribute to a month, and a restaurant that signed and then churned still counts
   * towards it. Do not present it as earned, and never add it to onetimeBonusEarned:
   * the sum would state a payment that was never made.
   * Integer minor units (øre) — format with the shared priceLabel helper, never by hand.
   */
  public monthlyBonusEarned: number
}
