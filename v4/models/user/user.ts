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
  deliveryInstructions: string;

  companyEmail: string;
  companyName: string;
  companyVat: string;
  companyAddress: string;
  companyZipCode: string;
  companyCity: string;
}
