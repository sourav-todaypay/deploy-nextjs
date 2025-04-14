import { PaginationRoot } from '@/types/PaginationRoot';

export interface FeeRatePaginatedResponse extends PaginationRoot {
  data: FeeRate[];
}

export interface FeeRate {
  id: number;
  name: string;
  description: string;
  flat_rate_in_cents: number;
  percentage_rate: number;
  entity: 'CUSTOMER' | 'MERCHANT' | undefined;
  type: string;
}
