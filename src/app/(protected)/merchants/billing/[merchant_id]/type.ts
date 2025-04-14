import { PaginationRoot } from '@/types/PaginationRoot';

export interface InvoicePaginatedResponse extends PaginationRoot {
  data: Invoice[];
}

export interface Invoice {
  uuid: string;
  created_at: string;
  due_date: string;
  invoice_number: string;
  amount_in_cents: number;
  status: string;
  period_start_date: string;
  period_end_date: string;
  ach_pull_ref_id: string;
  merchant_uuid: string;
}

export interface FundsPaginatedResponse extends PaginationRoot {
  pending_transfers: number;
  failed_transfers: number;
  settled_transfers: number;
  total_transfers: number;
  result: FundsResult;
}

export interface FundsResult extends PaginationRoot {
  data: FundTransaction[];
}

export interface FundTransaction {
  created_at: string;
  UUID: string;
  status: string;
  amount_in_cents: number;
}
