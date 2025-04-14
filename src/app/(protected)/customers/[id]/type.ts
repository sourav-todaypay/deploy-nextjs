import { PaginationRoot } from '@/types/PaginationRoot';

export interface TransactionsPaginatedResponse extends PaginationRoot {
  data: Transaction[];
}

export interface Transaction {
  created_at: Date;
  uuid: string;
  merchant_reference_id: string;
  amount_in_cents: number;
  first_name: string;
  email: string;
  last_name: string;
  phone_number: string;
  is_manual_disbursement: boolean;
  is_restocking_fee_claimable: boolean;
  is_restocking_fee_claimed: boolean;
  current_status_code: 100 | 101 | 102 | 103 | 104 | 105 | 106;
  current_status_code_description: string;
  account_uuid: string;
  kind: string;
  sub_type?: string;
  initiated_by_account_uuid?: string;
  merchant_uuid?: string;
}

export interface Customer {
  first_name: string;
  email: string;
  last_name: string;
  phone_number: string;
  refunds_count: number;
  status: string;
  created_at: string;
  credits_count: number;
  account_uuid: string;
  wallet: Wallet;
  dob: string;
  address: string;
  total_offer_amount_in_cents: number;
}

export interface Wallet {
  available_balance_in_cents: number;
  wallet_uuid: string;
}
