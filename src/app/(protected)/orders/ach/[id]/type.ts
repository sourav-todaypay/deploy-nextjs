export interface AchPullEvents {
  timestamp: string;
  amount: number;
  status: string;
  note: string;
  provider_id: string;
  external_ref_id: string;
  events: Events[];
}

export interface Events {
  event: string;
  uuid: string;
  payer_uuid: string;
  payee_uuid: string;
  currency: string;
  amount: number;
  transaction_fee: number;
  client_reference_id: string;
  payout_delay_days: number;
  type: string;
  status: string;
  capture_status: string;
  payout_status: string;
  created_at: string;
  updated_at: string;
  json_payload: string;
}
