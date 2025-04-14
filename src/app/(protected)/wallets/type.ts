import { PaginationRoot } from '@/types/PaginationRoot';

export interface TransactionsPaginatedResponse extends PaginationRoot {
  data: Transaction[];
}

export interface Transaction {
  available_balance_in_cents: number;
  pending_balance_in_cents: number;
  wallet_uuid: string;
  over_draft_limit_in_cents: number;
  user_uuid: string;
}
