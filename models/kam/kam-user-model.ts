
export class KamUserModel {
  public id: string
  public name: string
  public phoneNumber: string

  /**
   * Sum of the one-time bonuses this KAM earned inside the requested period.
   * Integer minor units (øre) — format with the shared priceLabel helper, never by hand.
   */
  public onetimeBonusEarned: number

  /**
   * Sum of the recurring monthly bonuses this KAM earned inside the requested period.
   * Integer minor units (øre) — format with the shared priceLabel helper, never by hand.
   */
  public monthlyBonusEarned: number
}
