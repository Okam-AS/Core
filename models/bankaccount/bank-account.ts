/* eslint-disable  */
import { ExternalAccount } from './external-account'
import { BankAccountRequirements } from './bank-account-requirements'

export class BankAccount {
    id: string;
    business_type: string;
    email: string;
    external_accounts: ExternalAccount;
    requirements: BankAccountRequirements;
}