import { PaginationRoot } from '@/types/PaginationRoot';

export interface BrandRulesResponse extends PaginationRoot {
  data: Rule[] | null;
}

export interface Rule {
  id?: number;
  name: string;
  brand_name?: string;
  brand_id?: number;
  rule: string;
  amount_in_cents: number | null;
  provider_id: number;
  weight: number;
  provider_name: string | null;
}

export interface GetAllRules {
  rules: string[];
}
