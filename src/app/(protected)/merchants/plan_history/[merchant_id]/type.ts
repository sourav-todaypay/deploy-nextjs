import { PaginationRoot } from '@/types/PaginationRoot';

export interface MerchantPlanHistoryResponse extends PaginationRoot {
  data: MerchantPlanData[];
}

export interface MerchantPlanData {
  plan_id: number;
  plan_name: string;
  effective_from: string;
  effective_till: string;
  status: string;
  plan_type: string;
  plan_uuid: string;
}
