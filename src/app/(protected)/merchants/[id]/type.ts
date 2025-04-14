import { PaginationRoot } from '@/types/PaginationRoot';

export interface Merchant {
  uuid: string;
  corporate_name: string;
  doing_business_as: string;
  employer_identification_number: string;
  address: Address;
  current_plan_name: string;
  plan_type: string;
  current_plan_id: string;
  current_plan_start_date: string;
  current_plan_end_date: string;
  next_billing_date: string;
  approved_at: string;
  bank_provider_reference_uuid: string;
  next_state: string;
  logo: Logo;
  refunds_count: number;
  website: string;
  is_blocked: boolean;
  application_status: string;
  fee_rate_details: FeeRateDetails;
  transaction_workflow: TransactionWorkflow;
  role: Role;
  permissions: string[];
  sftp_enabled: boolean;
  splash_banner: SplashBanner;
  disbursement_batch_delayed_by_in_minutes: number;
  instant_notifications_enabled: boolean;
  minimum_refund_amount_in_cents: number;
  maximum_refund_amount_in_cents: number;
  merchant_sender_email: string;
  merchant_refund_limit_per_day_in_cents: number;
}

export interface Wallet {
  available_balance_in_cents: number;
  wallet_uuid: string;
}

export interface User {
  first_name: string;
  last_name: string;
  phone_number: string;
  email: string;
  merchants: Merchant[];
  wallet: Wallet;
  refunds_count: number;
  dob: string;
  address: Address | null;
  total_offer_amount_in_cents: number | null;
  role: string;
  user_uuid: string;
  days_saved: number;
  user_products: null;
  is_balance_refresh_enabled: boolean;
  merchant_refund_limit_per_day_in_cents: number;
}

export interface Address {
  line_1: string;
  country: string;
  city: string;
  state: string;
  zipcode: string;
  is_primary: boolean;
}

export interface Logo {
  uuid: string;
  file_type: string;
  file_key: string;
  file_name: string;
  category: string;
  status: string;
  account_uuid: string;
}

export interface FeeRateDetails {
  id: number;
  name: string;
  description: string;
  flat_rate_in_cents: number;
  percentage_rate: number;
}

export interface TransactionWorkflow {
  data: null;
  transaction_kind: string;
  sub_type: string;
  on_status_code: number;
  is_default: boolean | null;
  name: string;
}

export interface Role {
  id: number;
  display_name: string;
  is_active: boolean;
  is_default: boolean;
  merchant_uuid: string;
}

export interface SplashBanner {
  uuid: string;
  file_type: string;
  file_key: string;
  file_name: string;
  category: string;
  status: string;
  account_uuid: string;
}

export interface TransactionsPaginatedResponse extends PaginationRoot {
  data: RefundData[];
}

export interface RefundData {
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
