export interface OrderAttempts {
  uuid: string;
  created_at: string;
  updated_at: string;
  status: string;
  amount_in_cents: number;
  fees_in_cents: number;
  due_date: string;
  attempts: AttemptDetails[];
  payer_account_details: BankDetails;
  payee_account_details: BankDetails;
}

export interface AttemptDetails {
  created_at: string;
  uuid: string;
  status: string;
  d2c_payment_id: number;
  provider_reference_id: string;
}

export interface BankDetails {
  bank_name: string;
  uuid: string;
  account_number: string;
  routing_number: string;
}
