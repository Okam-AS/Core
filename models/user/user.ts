import { Address } from '../index'

export class User {
  id: string;
  phoneNumber: string;
  address: Address;
  token: string;
  favoriteProductIds: string[];
}