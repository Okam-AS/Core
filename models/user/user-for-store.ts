export class UserForStore {
  id: string;
  phoneNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  emailConfirmed: boolean;
  data: { [key: string]: string };
}
