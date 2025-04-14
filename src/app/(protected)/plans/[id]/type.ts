export interface Plan {
  key: string;
  uuid: string;
  description: string;
  fees_in_cents: number;
  is_enabled: string;
  is_associated_to_merchant: boolean;
  plan_name: string;
  is_credit_allowed: boolean;
  settlement_cycle_in_days?: number | undefined;
  credit_in_cents?: number | undefined;
  minimum_balance_in_cents: number | null;
  type: 'INVOICING' | 'PREPAID';
}
