export class ApplicationUser {
  id: string;
  phoneNumber: string;
  registered?: Date;
  confirmed?: Date;
  stripeCustomerId?: string;
  fullAddress?: string;
  zipCode?: string;
  city?: string;
  firstName?: string;
  lastName?: string;
  birthDate?: Date;
  showFeedback: boolean;
  favoriteProductIds: string[];
  adminIn: any[];
  token: string;
  email?: string;
  emailConfirmed: boolean;
}
