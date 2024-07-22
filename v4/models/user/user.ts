export class User {
  id: string;
  phoneNumber: string;
  email: string;
  emailConfirmed: boolean;
  token: string;

  favoriteProductIds: string[];

  fullAddress: string;
  zipCode: string;
  city: string;
}
