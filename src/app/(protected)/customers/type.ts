import { PaginationRoot } from '@/types/PaginationRoot';

export interface CustomersPaginatedResponse extends PaginationRoot {
  data: Customer[];
}

export interface Customer {
  first_name: string;
  email: string;
  last_name: string;
  refund_volume_in_cents: number;
  account_uuid: string;
  created_at: string;
  phone_number: string;
}
