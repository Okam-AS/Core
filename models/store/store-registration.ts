export class StoreRegistration {
    name: string;
    legalName: string;
    vat: number;
    fullAddress: string;
    zipCode: string;
    city: string;
    acceptedTerms: boolean;

    constructor (name: string, legalName: string, vat: number, fullAddress: string, zipCode: string, city: string, acceptedTerms: boolean) {
      this.name = name
      this.legalName = legalName
      this.vat = vat
      this.fullAddress = fullAddress
      this.zipCode = zipCode
      this.city = city
      this.acceptedTerms = acceptedTerms
    }
}