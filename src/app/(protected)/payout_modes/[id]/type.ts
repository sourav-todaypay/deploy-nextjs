export interface PaymentMode {
  mode: string;
  title: string;
  settlement_time: string;
  sort_order: number;
  minimum_cashback_percentage: number;
  maximum_cashback_percentage: number;
  fee_rate_id: number;
  fee_rate_name: string;
  fee_flat_rate_in_cents: number;
  fee_entity: string;
  fee_type: string;
  is_disabled: boolean;
  fee_percentage_rate: string;
  fee_rate_description: string;
  helper_text: string;
}
