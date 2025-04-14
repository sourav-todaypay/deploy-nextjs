import { PaginationRoot } from '@/types/PaginationRoot';

export interface paymentPlansPaginatedResponse extends PaginationRoot {
  data: paymentPlanDetails[];
}

export interface paymentPlanDetails {
  uuid: string;
  name: string;
  internal_name: string;
  number_of_installments: number;
  frequency_in_days: number;
  plan_validity_in_days: number;
  percentage_per_installment: number;
  fees_in_cents: number;
  fees_in_percentage: number;
  minimum_transaction_amount_in_cents: number;
  maximum_transaction_amount_in_cents: number;
  is_active: boolean;
}
