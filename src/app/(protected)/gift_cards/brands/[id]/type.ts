import { PaginationRoot } from '@/types/PaginationRoot';

export interface ProductsPaginatedResponse extends PaginationRoot {
  data: Product[];
}

export interface Product {
  id: number;
  key: string;
  name: string;
  type: string;
  countries: string | null;
  credential_types: string | null;
  value_type: string;
  fixed_value: number;
  max_value: number;
  min_value: number;
  redemption_instructions: string;
  status: boolean;
  provider_product_id: string;
  brand_id: number;
  brand_name: string;
  display_name: string;
  product_image_url: string;
  is_enabled: boolean;
  provider_name: string;
}
