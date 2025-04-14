import { PaginationRoot } from '@/types/PaginationRoot';

export interface d2cMerchantListPaginatedResponse extends PaginationRoot {
  data: MerchantData[];
}

export interface MerchantData {
  name: string;
  logo_path: string;
  return_url: string;
  is_active: boolean;
  slug: string;
  additional_data: object;
  action_state: object;
  refund_processing_days: number;
  brand_id: number;
  is_featured: boolean;
  return_policy_link: string;
  order_number_regex: string;
}
