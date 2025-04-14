import { PaginationRoot } from '@/types/PaginationRoot';

export interface TransactionsPaginatedResponse extends PaginationRoot {
  data: WalletTransaction[];
}

export interface WalletTransaction {
  uuid: string;
  amount_in_cents: number;
  opening_balance_in_cents: number;
  closing_balance_in_cents: number;
  created_at: string;
  status: string;
  to_wallet_uuid: string;
  type: string;
  description: string;
  from_wallet_uuid: string;
  purpose_code: string;
  context: Context;
}

export interface Context {
  fee_in_cents: number;
  fee_rates: null | number;
  offer_amount_in_cents: number;
}
