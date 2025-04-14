import { PaginationRoot } from '@/types/PaginationRoot';

export interface PlansPaginatedResponse extends PaginationRoot {
  data: Plan[];
}

export interface Plan {
  key: string;
  plan_name: string;
  uuid: string;
  description: string;
  is_credit_allowed: boolean;
  settlement_cycle_in_days: number;
  credit_in_cents: number;
  minimum_balance_in_cents: number;
  fees_in_cents: number;
  type: string;
  is_enabled: string;
  is_associated_to_merchant: boolean;
}
