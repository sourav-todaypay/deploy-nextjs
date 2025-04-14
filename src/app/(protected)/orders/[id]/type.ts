import { PaginationRoot } from '@/types/PaginationRoot';

export interface paymentListPaginatedResponse extends PaginationRoot {
  data: PaymentList[];
}

export interface PaymentList {
  created_at: string;
  updated_at: string;
  uuid: string;
  status: string;
  amount_in_cents: number;
  fees_in_cents: number;
  due_date: string;
  processing_date: string;
  order_id: string;
  attempts: PaymentAttempts[];
  bank_account: BankDetails;
}

export interface PaymentAttempts {
  uuid: string;
  status: string;
  d2c_payment_id: number;
  provider_reference_id: string;
  failure_reason?: string;
}

export interface BankDetails {
  uuid: string;
  account_number: string;
  account_type: string;
  bank_name: string;
  provider_account_id: string;
  routing_number: string;
  status: string;
  image: string;
  primary_from: string;
}

export interface OrderPayments {
  uuid: string;
  created_at: string;
  total_amount_in_cents: number;
  email: string;
  phone_number: string;
  account_uuid: string;
  gift_card_brand: string;
  gift_card_provider: string;
  gift_card_amount: number;
  first_name: DOMStringList;
  last_name: string;
  merchant_name: string;
  payment_plan_details: PlanDetails;
  payer_account_details: BankDetails;
  payee_account_details: BankDetails;
  checkout_id: string;
}

export interface PlanDetails {
  plan_name: string;
  uuid: string;
}

export interface BankDetails {
  bank_name: string;
  uuid: string;
  account_number: string;
  routing_number: string;
}
