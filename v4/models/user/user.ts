export class User {
  id: string;
  phoneNumber: string;
  email: string;
  emailConfirmed: boolean;
  token: string;

  favoriteProductIds: string[];

  firstName: string;
  lastName: string;

  showFeedback: boolean;

  fullAddress: string;
  zipCode: string;
  city: string;
}
