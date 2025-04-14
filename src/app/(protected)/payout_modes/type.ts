export interface PaymentModes {
  mode: string;
  title: string;
  settlement_time: string;
  fee_rate_name: string;
  fee_rate_description: string;
  fee_flat_rate_in_cents: number;
  fee_percentage_rate: number;
  fee_entity: string;
  fee_type: string;
  is_selected: boolean;
  minimum_cashback_percentage: number;
  maximum_cashback_percentage: number;
  is_disabled: boolean;
}
