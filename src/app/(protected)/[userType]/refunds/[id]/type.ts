export interface TransactionDetail {
  id: string;
  current_status_code: number;
  current_status_code_description: string;
  amount_in_cents: number;
  merchant: Merchant;
  merchant_uuid: string;
  order: Order;
  products: Product[];
  status_updates: StatusUpdate[];
  shipping: Shipping;
  customer: Customer;
  originalTender: string;
  kind: string;
  sub_type: string;
  reason: string;
  claim_disabled_reason: string;
  is_restocking_fee_claimable: boolean;
  type: string;
  restocking_claim: RestockingDetails;
  transaction_order_description: string | null;
  note: string;
  cancelled_by_account_uuid: string;
}

interface Merchant {
  name: string;
  email: string;
  uuid: string;
}

interface Order {
  id: string;
  detailed_url: string;
}

interface Product {
  id: string;
  quantity: number;
  price_in_cents: number;
}

interface StatusUpdate {
  code: number;
  description: string;
  created_at: string;
}

interface Shipping {
  provider_name: string;
  tracking_number: string;
}

export interface Customer {
  fee_in_cents: number;
  fee_rates: null | number;
  offer_amount_in_cents: number;
  phone_number: string;
  account_uuid: string;
  first_name: string;
  last_name: string;
  email: string;
  country_code: string;
}

export interface RestockingDetails {
  reason: string;
  amount_in_cents: number;
  created_at: string;
}
