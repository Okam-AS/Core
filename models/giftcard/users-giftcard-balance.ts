import { UsersGiftcardBalanceTransaction } from "..";

export class UsersGiftcardBalance {
  balance: number;
  thasGiftcardype: boolean;
  transactions: Array<UsersGiftcardBalanceTransaction> = [];
}
