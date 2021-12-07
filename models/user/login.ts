export class Login {
  phoneNumber: string;
  token: string;
  constructor (phoneNumber: string, token: string) {
    this.phoneNumber = phoneNumber
    this.token = token
  }
}