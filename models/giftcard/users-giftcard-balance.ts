import { UsersGiftcardBalanceTransaction } from "..";

export class UsersGiftcardBalance {
  balance: number;
  hasGiftcard: boolean;
  transactions: Array<UsersGiftcardBalanceTransaction> = [];
}
