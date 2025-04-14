import { PaginationRoot } from '@/types/PaginationRoot';

export interface WaitListPaginatedResponse extends PaginationRoot {
  data: waitList[];
}

export interface waitList {
  account_uuid: string;
  product_name: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  status: string;
  waitlisted_date: string;
}
